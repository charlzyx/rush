set -e
set -x

mkdir tmp.iconset
# 生成16*16 pic是1024*1024的png图
sips -z 16 16 logo.png --out tmp.iconset/icon_16x16.png
sips -z 32 32 logo.png --out tmp.iconset/icon_16x16@2x.png
sips -z 32 32 logo.png --out tmp.iconset/icon_32x32.png
sips -z 64 64 logo.png --out tmp.iconset/icon_32x32@2x.png
sips -z 128 128 logo.png --out tmp.iconset/icon_128x128.png
sips -z 256 256 logo.png --out tmp.iconset/icon_128x128@2x.png
sips -z 256 256 logo.png --out tmp.iconset/icon_256x256.png
sips -z 512 512 logo.png --out tmp.iconset/icon_256x256@2x.png
sips -z 512 512 logo.png --out tmp.iconset/icon_512x512.png
sips -z 1024 1024 logo.png --out tmp.iconset/icon_512x512@2x.png

iconutil -c icns tmp.iconset -o ./src-tauri/icons/icon.icns
rm -rf tmp.iconset

sips -z 30 30 logo.png --out ./src-tauri/icons/Square30x30Logo.png
sips -z 44 44 logo.png --out ./src-tauri/icons/Square44x44Logo.png
sips -z 71 71 logo.png --out ./src-tauri/icons/Square71x71Logo.png
sips -z 89 89 logo.png --out ./src-tauri/icons/Square89x89Logo.png
sips -z 107 107 logo.png --out ./src-tauri/icons/Square107x107Logo.png
sips -z 142 142 logo.png --out ./src-tauri/icons/Square142x142Logo.png
sips -z 150 150 logo.png --out ./src-tauri/icons/Square150x150Logo.png
sips -z 284 284 logo.png --out ./src-tauri/icons/Square284x284Logo.png
sips -z 310 310 logo.png --out ./src-tauri/icons/Square310x310Logo.png

sips -z 512 512 logo.png --out ./src-tauri/icons/StoreLogo.png
npx png-to-ico logo.png > ./src-tauri/icons/icon.ico
