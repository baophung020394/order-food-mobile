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

  const neumorphicOutset = {
    shadowColor: '#D1D1D1',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 8,
  };
  const neumorphicInset = {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: -4, height: -4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: -4,
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
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
      >
        <View 
          className="w-[94%] max-h-[95%] rounded-3xl px-6 py-8"
          style={{
            backgroundColor: '#EEEEEE',
            ...neumorphicOutset,
          }}
        >
          <Text className="text-center text-2xl font-bold mb-6" style={{ color: '#64748B' }}>
            {editItem ? "Chỉnh sửa món ăn" : "Thêm món ăn mới"}
          </Text>
          <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
            {/* Name */}
            <View className="mb-2">
              <Text className="font-semibold mb-2 text-sm" style={{ color: '#64748B' }}>Tên món *</Text>
              <TextInput
                className="rounded-3xl px-4 py-3 text-base"
                style={{
                  backgroundColor: '#EEEEEE',
                  color: '#64748B',
                  ...neumorphicInset,
                }}
                placeholder="VD: Phở bò đặc biệt"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
              />
            </View>
            {/* Description */}
            <View>
              <Text className="font-semibold mb-2 text-sm" style={{ color: '#64748B' }}>Mô tả</Text>
              <TextInput
                className="rounded-3xl px-4 py-3 h-24 text-base"
                style={{
                  backgroundColor: '#EEEEEE',
                  color: '#64748B',
                  ...neumorphicInset,
                }}
                placeholder="Mô tả món ăn..."
                placeholderTextColor="#94A3B8"
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="font-semibold mb-2 text-sm" style={{ color: '#64748B' }}>Giá (VND) *</Text>
                <TextInput
                  className="rounded-3xl px-4 py-3 text-base"
                  style={{
                    backgroundColor: '#EEEEEE',
                    color: '#64748B',
                    ...neumorphicInset,
                  }}
                  placeholder="0"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>
              <View className="flex-1">
                <Text className="font-semibold mb-2 text-sm" style={{ color: '#64748B' }}>Thời gian chuẩn bị (phút) *</Text>
                <TextInput
                  className="rounded-3xl px-4 py-3 text-base"
                  style={{
                    backgroundColor: '#EEEEEE',
                    color: '#64748B',
                    ...neumorphicInset,
                  }}
                  placeholder="0"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={prepTime}
                  onChangeText={setPrepTime}
                />
              </View>
            </View>
            {/* Category select */}
            <View>
              <Text className="font-semibold mb-3 mt-2 text-sm" style={{ color: '#64748B' }}>Danh mục *</Text>
              <View 
                className="flex-row gap-2 justify-between p-1 rounded-3xl mb-2"
                style={{
                  backgroundColor: '#EEEEEE',
                  ...neumorphicInset,
                }}
              >
                {Object.keys(categoryLabels).map((cat) => {
                  const pastelColors: Record<string, string> = {
                    main: '#F4D1AE',
                    starter: '#C4E4D4',
                    drink: '#B8D4E3',
                    dessert: '#F2C2D1',
                  };
                  const isActive = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      className="flex-1 items-center px-3 py-2.5 rounded-2xl"
                      style={{
                        marginHorizontal: 2,
                        backgroundColor: isActive ? pastelColors[cat] || '#EEEEEE' : '#EEEEEE',
                        ...(isActive ? neumorphicInset : neumorphicOutset),
                      }}
                      activeOpacity={0.8}
                      onPress={() => setCategory(cat)}
                    >
                      <Text 
                        className="text-sm font-semibold"
                        style={{ color: '#64748B' }}
                      >
                        {categoryLabels[cat]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            {/* Image URL */}
            <View>
              <Text className="font-semibold mb-2 text-sm" style={{ color: '#64748B' }}>URL hình ảnh</Text>
              <TextInput
                className="rounded-3xl px-4 py-3 text-base"
                style={{
                  backgroundColor: '#EEEEEE',
                  color: '#64748B',
                  ...neumorphicInset,
                }}
                placeholder="https://..."
                placeholderTextColor="#94A3B8"
                value={imageUrl}
                onChangeText={setImageUrl}
              />
            </View>
            {/* Available switch */}
            <View 
              className="flex-row items-center justify-between rounded-3xl mt-3 px-4 py-4"
              style={{
                backgroundColor: '#EEEEEE',
                ...neumorphicInset,
              }}
            >
              <View>
                <Text className="font-semibold mb-1" style={{ color: '#64748B' }}>Còn hàng</Text>
                <Text className="text-xs" style={{ color: '#94A3B8' }}>Món này có sẵn để đặt</Text>
              </View>
              <Switch
                value={isAvailable}
                onValueChange={setIsAvailable}
                trackColor={{ false: '#D1D1D1', true: '#C4E4D4' }}
                thumbColor={isAvailable ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
            {/* Actions */}
            <View className="flex-row items-center justify-end gap-3 mt-8">
              <TouchableOpacity
                className="px-6 py-2.5 rounded-3xl"
                style={{
                  backgroundColor: '#EEEEEE',
                  ...neumorphicOutset,
                }}
                onPress={onClose}
              >
                <Text className="font-semibold text-sm" style={{ color: '#64748B' }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-6 py-2.5 rounded-3xl"
                style={{
                  backgroundColor: '#C4E4D4',
                  ...neumorphicInset,
                }}
                onPress={handleSubmit}
              >
                <Text className="font-semibold text-sm" style={{ color: '#64748B' }}>{editItem ? "Cập nhật" : "Thêm món"}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
