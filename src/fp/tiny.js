/* eslint-disable no-shadow */
/**
 * Image Transform Plugin
 */

import { tiny } from '../lib/pngtiny';
const TINY_SUPPORTE = /jpg|jpeg|png|gif/i;
// const IMAGE_SUFFIX = /jpg|jpeg|webp|gif|png|bmp|svg/i;

const readable = (limit) => {
  var size = '';
  if (limit < 1 * 1024) {
    //小于1KB，则转化成B
    size = `${limit.toFixed(2)}Bytes`;
  } else if (limit < 1 * 1024 * 1024) {
    //小于1MB，则转化成KB
    size = `${(limit / 1024).toFixed(2)}KB`;
  } else if (limit < 1 * 1024 * 1024 * 1024) {
    //小于1GB，则转化成MB
    size = `${(limit / (1024 * 1024)).toFixed(2)}MB`;
  } else {
    //其他转化成GB
    size = `${(limit / (1024 * 1024 * 1024)).toFixed(2)}GB`;
  }
  var sizeStr = `${size}`; //转成字符串
  var index = sizeStr.indexOf('.'); //获取小数点处的索引
  var dou = sizeStr.slice(index + 1, 2); //获取小数点后两位的值
  if (dou === '00') {
    //判断后两位是否为00，如果是则删除00
    return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2);
  }
  return size;
};

const plugin = ({ addFilter, utils }) => {
  const { Type, createRoute } = utils;
  console.log(utils);

  /**
   * Filters
   */
  addFilter(
    'SHOULD_PREPARE_OUTPUT',
    (shouldPrepareOutput, { query }) =>
      new Promise((resolve) => {
        // If is not async should prepare now
        resolve(!query('IS_ASYNC'));
      }),
  );

  // subscribe to file transformations
  addFilter('PREPARE_OUTPUT', (file, { query, item }) => {
    // no need to transform, exit
    if (!TINY_SUPPORTE.test(file.name)) return Promise.resolve(file);
    let quality = query('GET_TINY_QUALITY');
    quality = Math.min(quality, 100);
    quality = Math.max(quality, 0);

    const preSize = file.size;
    // console.log('preSize', preSize);

    return tiny(file, quality)
      .then((lit) => {
        // update transform metadata object
        // console.log('after', lit.size);
        item.setMetadata(
          'tiny',
          {
            quality,
            before: preSize,
            after: lit.size,
            ratio: lit.size / preSize,
          },
          true,
        );
        return Promise.resolve(lit);
      })
      .catch((e) => {
        console.error('tiny error', e);
        return file;
      });
  });

  // preview
  addFilter('CREATE_VIEW', (viewAPI) => {
    // get reference to created view
    const { is, view, query } = viewAPI;
    // only hook up to item view and only if is enabled for this cropper
    if (!is('file')) return;

    // start writing
    view.registerWriter(
      createRoute(
        {
          DID_UPDATE_ITEM_METADATA: ({ root, props, action }) => {
            if (!root.ref.tiny) return;

            if (/tiny/.test(action.change.key)) {
              const { before, after, ratio } = action.change.value;
              root.ref.tinybox.setAttribute(
                'class',
                `file-tiny-blur ${root.ref.tinybox.getAttribute('class')}`,
              );
              if (!ratio || ratio >= 1) {
                root.ref.tinysize.innerHTML = `✨ 已是最优!`;
                return;
              }

              root.ref.tinysize.innerHTML = `${readable(before)} ~> ${readable(
                after,
              )}`;

              root.ref.tinyoptimize.innerHTML = ` ⚡️ -${(
                100 -
                ratio * 100
              ).toFixed(2)}% !`;
            }
          },
          // DID_SET_ONPROCESSFILES: ({ root, props, action }) => {
          //   if (!root.ref.tinybgimg) return;
          //   const item = query('GET_ITEM', props?.id);
          //   const url = item?.serverId;
          //   if (IMAGE_SUFFIX.test(url)) {
          //     root.ref.tinybgimg.setAttribute('src', url);
          //     root.ref.tinybgimg.setAttribute('style', 'display: block;');
          //   }
          // },
        },
        ({ root, props }) => {
          if (root.ref.tiny) {
            return;
          }
          const tiny = document.createElement('div');
          tiny.className = 'file-tiny';
          const box = document.createElement('div');
          box.className = 'file-tiny-box';
          const size = document.createElement('div');
          size.className = 'file-tiny-size';
          const optimize = document.createElement('div');
          optimize.className = 'file-tiny-optimize';
          // const bgimg = document.createElement('img');
          // bgimg.className = 'file-tiny-bgimg';

          box.appendChild(size);
          box.appendChild(optimize);
          // tiny.appendChild(bgimg);
          tiny.appendChild(box);

          root.ref.tinysize = size;
          root.ref.tinyoptimize = optimize;
          root.ref.tinybox = box;
          // root.ref.tinybgimg = bgimg;
          root.ref.tiny = tiny;

          root.appendChild(tiny);
        },
      ),
    );
  });

  // Expose plugin options
  return {
    options: {
      tinyQuality: [null, Type.INT],
    },
  };
};

export default plugin;
