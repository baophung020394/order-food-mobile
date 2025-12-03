import { BlurView } from "expo-blur";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";

interface MenuItemDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: any) => void;
  editItem?: any;
}

const categoryLabels: Record<string, string> = {
  main: "Món chính",
  starter: "Khai vị",
  drink: "Đồ uống",
  dessert: "Tráng miệng",
};

export default function MenuItemDialog({ open, onClose, onSave, editItem }: MenuItemDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("main");
  const [prepTime, setPrepTime] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    if (editItem) {
      setName(editItem.name || "");
      setDescription(editItem.description || "");
      setPrice(editItem.price?.toString() || "");
      setCategory(editItem.category || "main");
      setPrepTime(editItem.prep_time_minutes?.toString() || "");
      setImageUrl(editItem.image_url || "");
      setIsAvailable(editItem.is_available ?? true);
    } else {
      setName("");
      setDescription("");
      setPrice("");
      setCategory("main");
      setPrepTime("");
      setImageUrl("");
      setIsAvailable(true);
    }
  }, [editItem, open]);

  const handleSubmit = () => {
    const menuItem = {
      ...(editItem && { id: editItem.id, created_at: editItem.created_at }),
      name,
      description,
      price: parseFloat(price),
      category,
      is_available: isAvailable,
      prep_time_minutes: parseInt(prepTime),
      image_url:
        imageUrl?.trim() ||
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
      metadata: { dietary: [] },
      updated_at: new Date().toISOString(),
    };
    onSave(menuItem as any);
    onClose();
  };

  return (
    <Modal
      visible={open}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        {/* Gradient Background Layers */}
        <View 
          className="absolute inset-0"
          style={{
            backgroundColor: '#3B82F6',
            opacity: 0.3,
          }}
        />
        <View 
          className="absolute inset-0"
          style={{
            backgroundColor: '#9333EA',
            opacity: 0.2,
          }}
        />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-center items-center w-full"
        >
          <BlurView
            intensity={25}
            tint="light"
            className="w-[94%] max-h-[95%] rounded-3xl px-6 py-8 overflow-hidden"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.3)',
            }}
          >
            {/* Light source highlight */}
            <View
              className="absolute top-0 left-0 right-0 h-1/4"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              }}
            />
            <Text className="text-center text-2xl font-bold mb-6" style={{ color: '#FFFFFF' }}>
              {editItem ? "Chỉnh sửa món ăn" : "Thêm món ăn mới"}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
              {/* Name */}
              <View className="mb-2">
                <Text className="font-semibold mb-2 text-sm" style={{ color: '#FFFFFF' }}>Tên món *</Text>
                <BlurView
                  intensity={10}
                  tint="light"
                  className="rounded-3xl overflow-hidden"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <TextInput
                    className="px-4 py-3 text-base"
                    style={{
                      color: '#FFFFFF',
                    }}
                    placeholder="VD: Phở bò đặc biệt"
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                    value={name}
                    onChangeText={setName}
                  />
                </BlurView>
              </View>
              {/* Description */}
              <View>
                <Text className="font-semibold mb-2 text-sm" style={{ color: '#FFFFFF' }}>Mô tả</Text>
                <BlurView
                  intensity={10}
                  tint="light"
                  className="rounded-3xl overflow-hidden"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <TextInput
                    className="px-4 py-3 h-24 text-base"
                    style={{
                      color: '#FFFFFF',
                    }}
                    placeholder="Mô tả món ăn..."
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                  />
                </BlurView>
              </View>
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="font-semibold mb-2 text-sm" style={{ color: '#FFFFFF' }}>Giá (VND) *</Text>
                  <BlurView
                    intensity={10}
                    tint="light"
                    className="rounded-3xl overflow-hidden"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <TextInput
                      className="px-4 py-3 text-base"
                      style={{
                        color: '#FFFFFF',
                      }}
                      placeholder="0"
                      placeholderTextColor="rgba(255, 255, 255, 0.6)"
                      keyboardType="numeric"
                      value={price}
                      onChangeText={setPrice}
                    />
                  </BlurView>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold mb-2 text-sm" style={{ color: '#FFFFFF' }}>Thời gian chuẩn bị (phút) *</Text>
                  <BlurView
                    intensity={10}
                    tint="light"
                    className="rounded-3xl overflow-hidden"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <TextInput
                      className="px-4 py-3 text-base"
                      style={{
                        color: '#FFFFFF',
                      }}
                      placeholder="0"
                      placeholderTextColor="rgba(255, 255, 255, 0.6)"
                      keyboardType="numeric"
                      value={prepTime}
                      onChangeText={setPrepTime}
                    />
                  </BlurView>
                </View>
              </View>
              {/* Category select */}
              <View>
                <Text className="font-semibold mb-3 mt-2 text-sm" style={{ color: '#FFFFFF' }}>Danh mục *</Text>
                <View 
                  className="flex-row gap-2 justify-between p-1 rounded-3xl mb-2"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  }}
                >
                  {Object.keys(categoryLabels).map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      className="flex-1 items-center px-3 py-2.5 rounded-2xl"
                      style={{
                        marginHorizontal: 2,
                        backgroundColor: category === cat ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)',
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      }}
                      activeOpacity={0.8}
                      onPress={() => setCategory(cat)}
                    >
                      <Text className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
                        {categoryLabels[cat]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              {/* Image URL */}
              <View>
                <Text className="font-semibold mb-2 text-sm" style={{ color: '#FFFFFF' }}>URL hình ảnh</Text>
                <BlurView
                  intensity={10}
                  tint="light"
                  className="rounded-3xl overflow-hidden"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <TextInput
                    className="px-4 py-3 text-base"
                    style={{
                      color: '#FFFFFF',
                    }}
                    placeholder="https://..."
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                    value={imageUrl}
                    onChangeText={setImageUrl}
                  />
                </BlurView>
              </View>
              {/* Available switch */}
              <BlurView
                intensity={10}
                tint="light"
                className="flex-row items-center justify-between rounded-3xl mt-3 px-4 py-4 overflow-hidden"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                }}
              >
                <View>
                  <Text className="font-semibold mb-1" style={{ color: '#FFFFFF' }}>Còn hàng</Text>
                  <Text className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Món này có sẵn để đặt</Text>
                </View>
                <Switch
                  value={isAvailable}
                  onValueChange={setIsAvailable}
                  trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: 'rgba(16, 185, 129, 0.5)' }}
                  thumbColor={isAvailable ? '#FFFFFF' : '#FFFFFF'}
                />
              </BlurView>
              {/* Actions */}
              <View className="flex-row items-center justify-end gap-3 mt-8">
                <BlurView
                  intensity={15}
                  tint="light"
                  className="px-6 py-2.5 rounded-3xl overflow-hidden"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <TouchableOpacity
                    className="w-full h-full items-center justify-center"
                    onPress={onClose}
                  >
                    <Text className="font-semibold text-sm" style={{ color: '#FFFFFF' }}>Hủy</Text>
                  </TouchableOpacity>
                </BlurView>
                <BlurView
                  intensity={15}
                  tint="light"
                  className="px-6 py-2.5 rounded-3xl overflow-hidden"
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.3)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <TouchableOpacity
                    className="w-full h-full items-center justify-center"
                    onPress={handleSubmit}
                  >
                    <Text className="font-semibold text-sm" style={{ color: '#FFFFFF' }}>{editItem ? "Cập nhật" : "Thêm món"}</Text>
                  </TouchableOpacity>
                </BlurView>
              </View>
            </ScrollView>
          </BlurView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
