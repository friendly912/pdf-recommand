import numpy as np
import torch
import cv2
import os
from django.conf import settings
import torch.nn as nn

import mediapipe as mp

# mp_pose = mp.solutions.pose

IMAGE_SIZE = (473, 473)

class SCHPModel(nn.Module):
    def __init__(self, num_classes=18):
        super().__init__()
        self.backbone = nn.Conv2d(3, 64, 3, padding=1)
        self.classifier = nn.Conv2d(64, num_classes, 1)

    def forward(self, x):
        x = self.backbone(x)
        x = self.classifier(x)
        return x

def load_infer_model():
    model = SCHPModel(num_classes=18)
    MODEL_PATH = os.path.join(settings.BASE_DIR, "checkpoints", "exp-schp-atr.pth")
    checkpoint = torch.load(MODEL_PATH, map_location="cpu")
    state_dict = checkpoint['state_dict'] if 'state_dict' in checkpoint else checkpoint
    new_state_dict = {}
    for k, v in state_dict.items():
        new_state_dict[k.replace("module.", "")] = v

    model.load_state_dict(new_state_dict, strict=False)
    model.eval()
    print("✅ Model loaded successfully")

    return model

def infer_preprocess(image_path):
    img = cv2.imread(image_path)
    original = img.copy()

    img = cv2.resize(img, IMAGE_SIZE)
    img = img / 255.0
    img = img.transpose(2, 0, 1)  # HWC → CHW
    img = np.expand_dims(img, 0)

    tensor = torch.tensor(img, dtype=torch.float32)
    return tensor, original

def predict(model, tensor):    
    with torch.no_grad():
        output = model(tensor)
        pred = torch.argmax(output, dim=1)
    return pred.squeeze().cpu().numpy()

def save_mask(mask):
    path = os.path.join(settings.BASE_DIR, "media", "mask.png")
    cv2.imwrite(path, mask.astype("uint8"))
    print(f"[INFO] Mask saved: {path}")

def colorize(mask):
    np.random.seed(42)
    colors = np.random.randint(0, 255, (20, 3))

    color_mask = colors[mask]
    color_mask = color_mask.astype("uint8")

    path = os.path.join(settings.BASE_DIR, "media", "color_mask.png")
    cv2.imwrite(path, color_mask)
    print(f"[INFO] Color mask saved: {path}")

    return color_mask

def overlay(original, color_mask):
    color_mask = cv2.resize(color_mask, (original.shape[1], original.shape[0]))
    overlay = cv2.addWeighted(original, 0.6, color_mask, 0.4, 0)

    path = os.path.join(settings.BASE_DIR, "media", "overlay.png")
    cv2.imwrite(path, overlay)
    print(f"[INFO] Overlay saved: {path}")

def extract_cloth(mask):
    # LIP dataset: 5 = upper clothes
    cloth_mask = (mask == 5).astype("uint8") * 255

    path = os.path.join(settings.BASE_DIR, "media", "extract_cloth.png")
    cv2.imwrite(path, cloth_mask)
    print(f"[INFO] Cloth mask saved: {path}")

def process_infer(input_image):

    # self correction human parsing
    model = load_infer_model()
    print(model)
    tensor, original = infer_preprocess(input_image)
    mask = predict(model, tensor)
    save_mask(mask)
    color_mask = colorize(mask)
    overlay(original, color_mask)
    extract_cloth(mask)

    mask_path = os.path.join(settings.BASE_DIR, "media", "color_mask.png")
    print("[DONE] Inference complete!")

    # open pose
    # pose_kp = get_pose_keypoints(input_image, draw=True)

    # if pose_kp is None:
    #     raise Exception("Pose detection failed")

    # return mask_path
 
def get_pose_keypoints(image_path, draw=False):
    # Load image
    image = cv2.imread(image_path)
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)


    # Initialize model
    # with mp_pose.Pose(static_image_mode=True) as pose:
    #     results = pose.process(image_rgb)

    # if not results.pose_landmarks:
    #     print("❌ No pose detected")
    #     return None

    # h, w, _ = image.shape

    # keypoints = {}

    # # Extract all 33 landmarks
    # for idx, lm in enumerate(results.pose_landmarks.landmark):
    #     x = int(lm.x * w)
    #     y = int(lm.y * h)
    #     keypoints[idx] = (x, y)

    # # Optional: draw skeleton
    # if draw:
    #     mp.solutions.drawing_utils.draw_landmarks(
    #         image,
    #         results.pose_landmarks,
    #         mp_pose.POSE_CONNECTIONS
    #     )
    #     path = os.path.join(settings.BASE_DIR, "media", "pose_debug.png")
    #     cv2.imwrite(path, image)

    # return keypoints

def extract_upper_body_points(keypoints):
    ids = {
        "left_shoulder": 11,
        "right_shoulder": 12,
        "left_elbow": 13,
        "right_elbow": 14,
        "left_wrist": 15,
        "right_wrist": 16,
    }

    return {name: keypoints[i] for name, i in ids.items()}