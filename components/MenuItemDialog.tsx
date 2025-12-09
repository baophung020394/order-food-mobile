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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
      >
        <View 
          className="w-[94%] max-h-[95%] rounded-2xl px-4 py-6"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.4)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <Text className="text-center text-xl font-bold mb-4" style={{ color: '#1e293b' }}>
            {editItem ? "Chỉnh sửa món ăn" : "Thêm món ăn mới"}
          </Text>
          <ScrollView showsVerticalScrollIndicator={false} className="space-y-3">
            {/* Name */}
            <View className="mb-1">
              <Text className="font-semibold mb-1" style={{ color: '#1e293b' }}>Tên món *</Text>
              <TextInput
                className="rounded-lg px-3 py-2 text-base"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                }}
                placeholder="VD: Phở bò đặc biệt"
                placeholderTextColor="rgba(30, 41, 59, 0.5)"
                value={name}
                onChangeText={setName}
              />
            </View>
            {/* Description */}
            <View>
              <Text className="font-semibold mb-1" style={{ color: '#1e293b' }}>Mô tả</Text>
              <TextInput
                className="rounded-lg px-3 py-2 h-20 text-base"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                }}
                placeholder="Mô tả món ăn..."
                placeholderTextColor="rgba(30, 41, 59, 0.5)"
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="font-semibold mb-1" style={{ color: '#1e293b' }}>Giá (VND) *</Text>
                <TextInput
                  className="rounded-lg px-3 py-2 text-base"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  }}
                  placeholder="0"
                  placeholderTextColor="rgba(30, 41, 59, 0.5)"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>
              <View className="flex-1">
                <Text className="font-semibold mb-1" style={{ color: '#1e293b' }}>Thời gian chuẩn bị (phút) *</Text>
                <TextInput
                  className="rounded-lg px-3 py-2 text-base"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  }}
                  placeholder="0"
                  placeholderTextColor="rgba(30, 41, 59, 0.5)"
                  keyboardType="numeric"
                  value={prepTime}
                  onChangeText={setPrepTime}
                />
              </View>
            </View>
            {/* Category select đẹp hơn */}
            <View>
              <Text className="font-semibold mb-1 mt-2" style={{ color: '#1e293b' }}>Danh mục *</Text>
              <View 
                className="flex-row gap-3 justify-between p-1 rounded-xl mb-2"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                }}
              >
                {Object.keys(categoryLabels).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    className={`flex-1 items-center px-2 py-2 rounded-lg border
                      ${category === cat ? "border-green-700" : ""}
                    `}
                    style={{
                      marginHorizontal: 2,
                      backgroundColor: category === cat ? 'rgba(34, 197, 94, 0.4)' : 'rgba(255, 255, 255, 0.3)',
                      borderWidth: 1,
                      borderColor: category === cat ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.5)',
                    }}
                    activeOpacity={0.85}
                    onPress={() => setCategory(cat)}
                  >
                    <Text className={`text-base ${category === cat ? "font-bold text-white" : "font-medium"}`} style={{ color: category === cat ? '#fff' : '#1e293b' }}>
                      {categoryLabels[cat]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {/* Image URL */}
            <View>
              <Text className="font-semibold mb-1" style={{ color: '#1e293b' }}>URL hình ảnh</Text>
              <TextInput
                className="rounded-lg px-3 py-2 text-base"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                }}
                placeholder="https://..."
                placeholderTextColor="rgba(30, 41, 59, 0.5)"
                value={imageUrl}
                onChangeText={setImageUrl}
              />
            </View>
            {/* Available switch */}
            <View 
              className="flex-row items-center justify-between rounded-lg mt-2 px-3 py-3"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.4)',
              }}
            >
              <View>
                <Text className="font-semibold mb-0.5" style={{ color: '#1e293b' }}>Còn hàng</Text>
                <Text className="text-sm" style={{ color: 'rgba(30, 41, 59, 0.6)' }}>Món này có sẵn để đặt</Text>
              </View>
              <Switch
                value={isAvailable}
                onValueChange={setIsAvailable}
              />
            </View>
            {/* Actions */}
            <View className="flex-row items-center justify-end gap-3 mt-7">
              <TouchableOpacity
                className="px-6 py-2 rounded-md"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                }}
                onPress={onClose}
              >
                <Text className="font-medium" style={{ color: '#1e293b' }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-6 py-2 rounded-md"
                style={{
                  backgroundColor: 'rgba(34, 197, 94, 0.5)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                }}
                onPress={handleSubmit}
              >
                <Text className="font-medium text-white">{editItem ? "Cập nhật" : "Thêm món"}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
