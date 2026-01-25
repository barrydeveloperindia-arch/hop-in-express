from PIL import Image
import os

def make_high_quality_pdf(image_folder, output_pdf_name):
    # Files identified: 1.jpg, 2.jpg, 3.png, 4.png (Adding Page 4)
    # A4 Dimensions at 300 DPI: 2480 x 3508 pixels
    A4_SIZE = (2480, 3508)
    
    image_files = ["1.png", "2.jpg", "3.png", "4.png", "5.jpg"]
    
    images = []
    
    print("Processing images into A4 format...")
    
    for fname in image_files:
        path = os.path.join(image_folder, fname)
        if os.path.exists(path):
            try:
                img = Image.open(path)
                
                # Convert to RGB
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                    
                # Resize to A4 using High Quality LANCZOS filter
                # This ensures they are all uniformly A4 sized
                img_resized = img.resize(A4_SIZE, Image.Resampling.LANCZOS)
                
                images.append(img_resized)
                print(f"Processed {fname} -> A4 Size {img_resized.size}")
                
            except Exception as e:
                print(f"Error processing {fname}: {e}")
        else:
            print(f"Warning: {fname} not found in {image_folder}")

    if images:
        output_path = os.path.join(os.getcwd(), output_pdf_name)
        
        # Save as PDF with optimal settings
        images[0].save(
            output_path, 
            "PDF", 
            resolution=300.0, 
            save_all=True, 
            append_images=images[1:],
            quality=100
        )
        print(f"Successfully generated High Quality A4 PDF: {output_path}")
    else:
        print("No images found to compile.")

if __name__ == "__main__":
    folder = r"c:\Users\SAM\Documents\Antigravity\hop-in-express---1\final_brochure_images"
    output = "Swati_Anand_Brochure_Final_Merged.pdf"
    make_high_quality_pdf(folder, output)
