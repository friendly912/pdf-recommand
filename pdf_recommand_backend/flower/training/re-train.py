import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
import os
import matplotlib.pyplot as plt

# =========================
# 📁 Paths
# =========================
base_dir = 'dataset/'
train_dir = os.path.join(base_dir, 'train')
val_dir = os.path.join(base_dir, 'val')

IMG_SIZE = (224, 224)
BATCH_SIZE = 32

# =========================
# 🔄 Data Generators
# =========================
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.1,
    height_shift_range=0.1,
    zoom_range=0.1,
    horizontal_flip=True
)

val_datagen = ImageDataGenerator(rescale=1./255)

train_generator = train_datagen.flow_from_directory(
    train_dir,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical'
)

val_generator = val_datagen.flow_from_directory(
    val_dir,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical'
)

NUM_CLASSES = train_generator.num_classes
# class_names = train_generator.class_names
# NUM_CLASSES = len(class_names)

AUTOTUNE = tf.data.AUTOTUNE

# train_generator = train_generator.shuffle(1000).prefetch(AUTOTUNE)

data_augmentation = tf.keras.Sequential([
    tf.keras.layers.RandomFlip("horizontal"),
    tf.keras.layers.RandomRotation(0.2),
])

base_model = tf.keras.models.load_model("flower_mobilenet.h5")
x = base_model.layers[-2].output   # feature layer
x = tf.keras.layers.Dropout(0.3, name="new_dropout")(x)

new_output = tf.keras.layers.Dense(NUM_CLASSES, activation='softmax', name="new_predictions")(x)

model = tf.keras.Model(inputs=base_model.inputs, outputs=new_output)
for layer in model.layers[:-1]:
    layer.trainable = False

# =========================
# ⚙️ Compile
# =========================
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

model.summary()

# =========================
# 🛑 Callbacks
# =========================
callbacks = [
    EarlyStopping(patience=5, restore_best_weights=True),
    ReduceLROnPlateau(patience=3, factor=0.3)
]

# =========================
# 🚀 Training (Phase 1)
# =========================
history = model.fit(
    train_generator,
    epochs=30,
    validation_data=val_generator,
    callbacks=callbacks
)

# =========================
# 🔥 Fine-Tuning (Phase 2)
# =========================
for layer in model.layers[-20:]:
    layer.trainable = True

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

history_fine = model.fit(
    train_generator,
    epochs=20,
    validation_data=val_generator,
    callbacks=callbacks
)

# =========================
# 📊 Evaluation
# =========================
val_loss, val_acc = model.evaluate(val_generator)
print(f'Validation Accuracy: {val_acc * 100:.2f}%')

model.save("flower_mobilenet_107.h5")
model.save("flower_mobilenet_107.keras")

# =========================
# 📈 Plot Accuracy
# =========================
plt.plot(history.history['accuracy'] + history_fine.history['accuracy'], label='train accuracy')
plt.plot(history.history['val_accuracy'] + history_fine.history['val_accuracy'], label='val accuracy')
plt.title('Training and Validation Accuracy')
plt.legend()
plt.show()

# =========================
# 📉 Plot Loss
# =========================
plt.plot(history.history['loss'] + history_fine.history['loss'], label='train loss')
plt.plot(history.history['val_loss'] + history_fine.history['val_loss'], label='val loss')
plt.title('Training and Validation Loss')
plt.legend()
plt.show()

