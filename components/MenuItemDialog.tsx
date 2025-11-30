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
      >
        <View className="bg-white w-[94%] max-h-[95%] rounded-2xl px-4 py-6">
          <Text className="text-center text-xl font-bold mb-4">
            {editItem ? "Chỉnh sửa món ăn" : "Thêm món ăn mới"}
          </Text>
          <ScrollView showsVerticalScrollIndicator={false} className="space-y-3">
            {/* Name */}
            <View className="mb-1">
              <Text className="font-semibold mb-1">Tên món *</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 text-base"
                placeholder="VD: Phở bò đặc biệt"
                value={name}
                onChangeText={setName}
              />
            </View>
            {/* Description */}
            <View>
              <Text className="font-semibold mb-1">Mô tả</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 h-20 text-base"
                placeholder="Mô tả món ăn..."
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="font-semibold mb-1">Giá (VND) *</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 text-base"
                  placeholder="0"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>
              <View className="flex-1">
                <Text className="font-semibold mb-1">Thời gian chuẩn bị (phút) *</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 text-base"
                  placeholder="0"
                  keyboardType="numeric"
                  value={prepTime}
                  onChangeText={setPrepTime}
                />
              </View>
            </View>
            {/* Category select đẹp hơn */}
            <View>
              <Text className="font-semibold mb-1 mt-2">Danh mục *</Text>
              <View className="flex-row gap-3 justify-between p-1 bg-gray-50 rounded-xl mb-2 shadow-sm">
                {Object.keys(categoryLabels).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    className={`flex-1 items-center px-2 py-2 rounded-lg border shadow-sm
                      ${category === cat ? "bg-green-600 border-green-700 scale-95" : "bg-white border-gray-300"}
                    `}
                    activeOpacity={0.85}
                    onPress={() => setCategory(cat)}
                    style={{ marginHorizontal: 2 }}
                  >
                    <Text className={`text-base ${category === cat ? "font-bold text-white" : "text-zinc-700 font-medium"}`}>
                      {categoryLabels[cat]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {/* Image URL */}
            <View>
              <Text className="font-semibold mb-1">URL hình ảnh</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 text-base"
                placeholder="https://..."
                value={imageUrl}
                onChangeText={setImageUrl}
              />
            </View>
            {/* Available switch */}
            <View className="flex-row items-center justify-between bg-gray-50 border rounded-lg mt-2 px-3 py-3">
              <View>
                <Text className="font-semibold mb-0.5">Còn hàng</Text>
                <Text className="text-sm text-gray-400">Món này có sẵn để đặt</Text>
              </View>
              <Switch
                value={isAvailable}
                onValueChange={setIsAvailable}
              />
            </View>
            {/* Actions */}
            <View className="flex-row items-center justify-end gap-3 mt-7">
              <TouchableOpacity
                className="px-6 py-2 rounded-md border border-gray-400 bg-white"
                onPress={onClose}
              >
                <Text className="font-medium">Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-6 py-2 rounded-md bg-green-600"
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
