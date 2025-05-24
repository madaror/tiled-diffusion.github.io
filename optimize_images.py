#!/usr/bin/env python3
"""
Enhanced image optimization script for Tiled Diffusion website
Creates both JPEG and WebP versions for better compression
"""

import os
import sys
from PIL import Image
import argparse


def optimize_image(input_path, output_path, max_width=1920, quality=85, format='JPEG', create_webp=True):
    """
    Optimize a single image by resizing and compressing it.
    Also creates a WebP version for better compression.

    Args:
        input_path: Path to input image
        output_path: Path to save optimized image
        max_width: Maximum width in pixels (height scaled proportionally)
        quality: JPEG quality (1-100)
        format: Output format (JPEG or WebP)
        create_webp: Also create a WebP version
    """
    try:
        # Open the image
        img = Image.open(input_path)

        # Check if it's a GIF
        is_gif = input_path.lower().endswith('.gif')

        # For GIFs, keep them as GIFs and don't convert
        if is_gif:
            output_path = output_path.rsplit('.', 1)[0] + '.gif'

            # Still resize if needed
            if img.width > max_width:
                ratio = max_width / img.width
                new_width = max_width
                new_height = int(img.height * ratio)
                try:
                    img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                except AttributeError:
                    img = img.resize((new_width, new_height), Image.LANCZOS)

            img.save(output_path, 'GIF', optimize=True)

            # Print size reduction
            original_size = os.path.getsize(input_path) / 1024 / 1024  # MB
            new_size = os.path.getsize(output_path) / 1024 / 1024  # MB
            reduction = (1 - new_size / original_size) * 100
            print(
                f"✓ {os.path.basename(input_path)}: {original_size:.2f}MB → {new_size:.2f}MB ({reduction:.1f}% reduction)")
        else:
            # Convert RGBA to RGB if saving as JPEG
            if format == 'JPEG' and img.mode in ('RGBA', 'LA', 'P'):
                # Create a white background
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background

            # Calculate new dimensions maintaining aspect ratio
            if img.width > max_width:
                ratio = max_width / img.width
                new_width = max_width
                new_height = int(img.height * ratio)
                # Use LANCZOS for high-quality downsampling
                try:
                    # For Pillow >= 10.0.0
                    img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                except AttributeError:
                    # For older versions of Pillow
                    img = img.resize((new_width, new_height), Image.LANCZOS)

            # Save optimized JPEG
            jpeg_path = output_path
            save_kwargs = {
                'optimize': True,
                'quality': quality,
                'progressive': True
            }
            img.save(jpeg_path, 'JPEG', **save_kwargs)

            # Print JPEG size reduction
            original_size = os.path.getsize(input_path) / 1024 / 1024  # MB
            jpeg_size = os.path.getsize(jpeg_path) / 1024 / 1024  # MB
            reduction = (1 - jpeg_size / original_size) * 100
            print(
                f"✓ {os.path.basename(input_path)} → JPEG: {original_size:.2f}MB → {jpeg_size:.2f}MB ({reduction:.1f}% reduction)")

            # Also create WebP version
            if create_webp:
                webp_path = output_path.rsplit('.', 1)[0] + '.webp'
                img.save(webp_path, 'WebP', quality=quality, method=6, lossless=False)

                # Print WebP size
                webp_size = os.path.getsize(webp_path) / 1024 / 1024  # MB
                webp_reduction = (1 - webp_size / original_size) * 100
                print(f"  → WebP: {webp_size:.2f}MB ({webp_reduction:.1f}% reduction)")

    except Exception as e:
        print(f"✗ Error processing {input_path}: {str(e)}")


def create_responsive_versions(input_path, output_dir, base_name, create_webp=True):
    """
    Create multiple sizes for responsive loading.
    """
    sizes = [
        (640, 'small'),
        (1024, 'medium'),
        (1920, 'large')
    ]

    for width, suffix in sizes:
        output_path = os.path.join(output_dir, f"{base_name}-{suffix}.jpg")
        optimize_image(input_path, output_path, max_width=width, quality=85, create_webp=create_webp)


def main():
    parser = argparse.ArgumentParser(description='Optimize images for web performance')
    parser.add_argument('--input-dir', default='images', help='Input directory containing images')
    parser.add_argument('--output-dir', default='images/optimized', help='Output directory for optimized images')
    parser.add_argument('--max-width', type=int, default=1920, help='Maximum width in pixels')
    parser.add_argument('--quality', type=int, default=85, help='JPEG quality (1-100)')
    parser.add_argument('--responsive', action='store_true', help='Create multiple sizes for responsive loading')
    parser.add_argument('--no-webp', action='store_true', help='Do not create WebP versions')

    args = parser.parse_args()

    # Create output directory
    os.makedirs(args.output_dir, exist_ok=True)

    # Process images
    processed = 0
    for root, dirs, files in os.walk(args.input_dir):
        # Skip the optimized directory
        if 'optimized' in root:
            continue

        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
                input_path = os.path.join(root, file)

                # Maintain directory structure
                rel_path = os.path.relpath(root, args.input_dir)
                output_subdir = os.path.join(args.output_dir, rel_path)
                os.makedirs(output_subdir, exist_ok=True)

                if args.responsive:
                    base_name = os.path.splitext(file)[0]
                    create_responsive_versions(input_path, output_subdir, base_name, not args.no_webp)
                else:
                    # Single optimized version
                    output_file = os.path.splitext(file)[0] + '.jpg'
                    output_path = os.path.join(output_subdir, output_file)
                    optimize_image(input_path, output_path, args.max_width, args.quality, 'JPEG', not args.no_webp)

                processed += 1

    print(f"\n✅ Processed {processed} images")
    print(f"📁 Optimized images saved to: {args.output_dir}")

    # Provide HTML snippet for using WebP with fallback
    if not args.no_webp:
        print("\n📝 Use this HTML pattern for WebP with JPEG fallback:")
        print("""
<picture>
    <source srcset="images/optimized/image.webp" type="image/webp">
    <img src="images/optimized/image.jpg" alt="Description" loading="lazy" width="800" height="400">
</picture>
        """)


if __name__ == "__main__":
    main()
