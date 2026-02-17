import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout, BatchNormalization
from tensorflow.keras.optimizers import Adam
import numpy as np
import os
import matplotlib.pyplot as plt

# --- 1. CONFIGURATION ---
IMG_SIZE = (128, 128)  # ขนาดรูปภาพที่ AI จะเห็น
BATCH_SIZE = 32        # จำนวนรูปที่ AI เรียนรู้ต่อครั้ง
EPOCHS = 15            # จำนวนรอบในการเรียนรู้ (เหมือนอ่านหนังสือ 15 รอบ)

# --- 2. DATA LOADING (ต้องเตรียมโฟลเดอร์รูปภาพไว้ก่อน) ---
# ตัวอย่าง: dataset/
#           ├── fertile_soil/    (รูปดินดี)
#           ├── sandy_soil/      (รูปดินทราย)
#           └── clay_soil/       (รูปดินเหนียว)

def create_model():
    model = Sequential([
        # Layer 1: รับแสง (Input)
        Conv2D(32, (3, 3), activation='relu', input_shape=(IMG_SIZE[0], IMG_SIZE[1], 3)),
        BatchNormalization(),
        MaxPooling2D((2, 2)),

        # Layer 2: มองหารูปทรง (Edges, Shapes)
        Conv2D(64, (3, 3), activation='relu'),
        BatchNormalization(),
        MaxPooling2D((2, 2)),

        # Layer 3: มองหารายละเอียด (Textures)
        Conv2D(128, (3, 3), activation='relu'),
        BatchNormalization(),
        MaxPooling2D((2, 2)),

        # Layer 4: แปลความหมาย (Dense Layers)
        Flatten(),
        Dense(128, activation='relu'),
        Dropout(0.5), # ป้องกันการจำข้อสอบ (Overfitting)

        # Output Layer: ตัดสินใจ (3 คลาส: ดินดี, ดินทราย, ดินเหนียว)
        Dense(3, activation='softmax') 
    ])

    model.compile(optimizer=Adam(learning_rate=0.001),
                  loss='categorical_crossentropy',
                  metrics=['accuracy'])
    return model

if __name__ == "__main__":
    print("TensorFlow Version:", tf.__version__)
    
    # ⚠️ ปลดล็อกบรรทัดข้างล่างเมื่อมี Dataset จริง
    # TRAIN_DIR = "dataset/train"
    # VALIDATION_DIR = "dataset/validation"

    # train_datagen = tf.keras.preprocessing.image.ImageDataGenerator(rescale=1./255, rotation_range=20)
    # train_generator = train_datagen.flow_from_directory(TRAIN_DIR, target_size=IMG_SIZE, batch_size=BATCH_SIZE)

    # model = create_model()
    # history = model.fit(train_generator, epochs=EPOCHS)
    
    # model.save("soil_classifier_model.h5")
    # print("Model saved successfully!")
