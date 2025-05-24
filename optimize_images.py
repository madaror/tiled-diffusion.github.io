#!/usr/bin/env python3
"""
Image optimization script for Tiled Diffusion website
Reduces image file sizes while maintaining visual quality
"""

import os
import sys
from PIL import Image
import argparse


def optimize_image(input_path, output_path, max_width=1920, quality=85, format='JPEG'):
    """
    Optimize a single image by resizing and compressing it.

    Args:
        input_path: Path to input image
        output_path: Path to save optimized image
        max_width: Maximum width in pixels (height scaled proportionally)
        quality: JPEG quality (1-100)
        format: Output format (JPEG or WebP)
    """
    try:
        # Open the image
        img = Image.open(input_path)

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
            img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)

        # Save optimized image
        save_kwargs = {
            'optimize': True,
            'quality': quality
        }

        if format == 'JPEG':
            save_kwargs['progressive'] = True
            img.save(output_path, 'JPEG', **save_kwargs)
        elif format == 'WebP':
            save_kwargs['method'] = 6  # Slowest but best compression
            img.save(output_path, 'WebP', **save_kwargs)

        # Print size reduction
        original_size = os.path.getsize(input_path) / 1024 / 1024  # MB
        new_size = os.path.getsize(output_path) / 1024 / 1024  # MB
        reduction = (1 - new_size / original_size) * 100

        print(
            f"✓ {os.path.basename(input_path)}: {original_size:.2f}MB → {new_size:.2f}MB ({reduction:.1f}% reduction)")

    except Exception as e:
        print(f"✗ Error processing {input_path}: {str(e)}")


def create_responsive_versions(input_path, output_dir, base_name):
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
        optimize_image(input_path, output_path, max_width=width, quality=85)


def main():
    parser = argparse.ArgumentParser(description='Optimize images for web performance')
    parser.add_argument('--input-dir', default='images', help='Input directory containing images')
    parser.add_argument('--output-dir', default='images/optimized', help='Output directory for optimized images')
    parser.add_argument('--max-width', type=int, default=1920, help='Maximum width in pixels')
    parser.add_argument('--quality', type=int, default=85, help='JPEG quality (1-100)')
    parser.add_argument('--format', choices=['JPEG', 'WebP'], default='JPEG', help='Output format')
    parser.add_argument('--responsive', action='store_true', help='Create multiple sizes for responsive loading')

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
                    create_responsive_versions(input_path, output_subdir, base_name)
                else:
                    # Single optimized version
                    ext = '.jpg' if args.format == 'JPEG' else '.webp'
                    output_file = os.path.splitext(file)[0] + ext
                    output_path = os.path.join(output_subdir, output_file)
                    optimize_image(input_path, output_path, args.max_width, args.quality, args.format)

                processed += 1

    print(f"\n✅ Processed {processed} images")
    print(f"📁 Optimized images saved to: {args.output_dir}")

    # Provide HTML snippet for responsive images
    if args.responsive:
        print("\n📝 Example HTML for responsive images:")
        print("""
<picture>
    <source media="(max-width: 640px)" srcset="images/optimized/image-small.jpg">
    <source media="(max-width: 1024px)" srcset="images/optimized/image-medium.jpg">
    <img src="images/optimized/image-large.jpg" alt="Description" loading="lazy">
</picture>
        """)


if __name__ == "__main__":
    main()
