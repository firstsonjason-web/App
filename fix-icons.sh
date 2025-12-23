#!/bin/bash
ICON_SOURCE="/Users/user/Desktop/App/assets/images/AppIcons/appstore.png"
TARGET_DIR="/Users/user/Desktop/App/ios/boltexponativewind/Images.xcassets/AppIcon.appiconset"

mkdir -p "$TARGET_DIR"

# iPhone
sips -z 40 40   "$ICON_SOURCE" --out "$TARGET_DIR/40.png"
sips -z 60 60   "$ICON_SOURCE" --out "$TARGET_DIR/60.png"
sips -z 58 58   "$ICON_SOURCE" --out "$TARGET_DIR/58.png"
sips -z 87 87   "$ICON_SOURCE" --out "$TARGET_DIR/87.png"
sips -z 80 80   "$ICON_SOURCE" --out "$TARGET_DIR/80.png"
sips -z 120 120 "$ICON_SOURCE" --out "$TARGET_DIR/120.png"
sips -z 180 180 "$ICON_SOURCE" --out "$TARGET_DIR/180.png"
sips -z 29 29   "$ICON_SOURCE" --out "$TARGET_DIR/29.png"

# iPad
sips -z 20 20   "$ICON_SOURCE" --out "$TARGET_DIR/20.png"
sips -z 76 76   "$ICON_SOURCE" --out "$TARGET_DIR/76.png"
sips -z 152 152 "$ICON_SOURCE" --out "$TARGET_DIR/152.png"
sips -z 167 167 "$ICON_SOURCE" --out "$TARGET_DIR/167.png"

# Marketing
sips -z 1024 1024 "$ICON_SOURCE" --out "$TARGET_DIR/1024.png"

cat <<EOF > "$TARGET_DIR/Contents.json"
{
  "images": [
    { "size": "20x20", "idiom": "iphone", "filename": "40.png", "scale": "2x" },
    { "size": "20x20", "idiom": "iphone", "filename": "60.png", "scale": "3x" },
    { "size": "29x29", "idiom": "iphone", "filename": "29.png", "scale": "1x" },
    { "size": "29x29", "idiom": "iphone", "filename": "58.png", "scale": "2x" },
    { "size": "29x29", "idiom": "iphone", "filename": "87.png", "scale": "3x" },
    { "size": "40x40", "idiom": "iphone", "filename": "80.png", "scale": "2x" },
    { "size": "40x40", "idiom": "iphone", "filename": "120.png", "scale": "3x" },
    { "size": "60x60", "idiom": "iphone", "filename": "120.png", "scale": "2x" },
    { "size": "60x60", "idiom": "iphone", "filename": "180.png", "scale": "3x" },
    { "size": "20x20", "idiom": "ipad", "filename": "20.png", "scale": "1x" },
    { "size": "20x20", "idiom": "ipad", "filename": "40.png", "scale": "2x" },
    { "size": "29x29", "idiom": "ipad", "filename": "29.png", "scale": "1x" },
    { "size": "29x29", "idiom": "ipad", "filename": "58.png", "scale": "2x" },
    { "size": "40x40", "idiom": "ipad", "filename": "40.png", "scale": "1x" },
    { "size": "40x40", "idiom": "ipad", "filename": "80.png", "scale": "2x" },
    { "size": "76x76", "idiom": "ipad", "filename": "76.png", "scale": "1x" },
    { "size": "76x76", "idiom": "ipad", "filename": "152.png", "scale": "2x" },
    { "size": "83.5x83.5", "idiom": "ipad", "filename": "167.png", "scale": "2x" },
    { "size": "1024x1024", "idiom": "ios-marketing", "filename": "1024.png", "scale": "1x" }
  ],
  "info": { "version": 1, "author": "xcode" }
}
EOF
