import { useTableContext } from "@/context/TableContext";
import { useRouter } from "expo-router";
import { ArrowLeft, MapPin, Plus, Users } from "lucide-react-native";
import { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const locationOptions = [
  { value: "main hall", label: "Sảnh chính", color: "#FF6B9D" },
  { value: "patio", label: "Sân ngoài", color: "#4ECDC4" },
  { value: "terrace", label: "Ban công", color: "#FFB347" },
  { value: "vip", label: "VIP", color: "#9B59B6" },
];

const statusOptions = [
  { value: "available", label: "Trống", color: "#4CAF50" },
  { value: "occupied", label: "Có khách", color: "#FF9800" },
  { value: "reserved", label: "Đã đặt", color: "#2196F3" },
  { value: "dirty", label: "Dọn dẹp", color: "#F44336" },
];

export default function CreateTableScreen() {
  const router = useRouter();
  const { createTable, refreshTables } = useTableContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tableNumber: "",
    seats: "",
    location: "main hall",
    status: "available",
  });

  const handleCreate = async () => {
    // Validation
    if (!formData.tableNumber.trim()) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng nhập số bàn",
      });
      return;
    }

    const seats = parseInt(formData.seats);
    if (!seats || seats < 1 || seats > 20) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Số chỗ ngồi phải từ 1 đến 20",
      });
      return;
    }

    setLoading(true);
    try {
      const newTable = await createTable({
        tableNumber: formData.tableNumber.trim(),
        seats,
        location: formData.location,
        status: formData.status,
      });
      
      // Validate that table was created successfully
      if (!newTable || !newTable.id) {
        throw new Error('Table created but response is invalid');
      }
      
      // Refresh tables list
      try {
        await refreshTables();
      } catch (refreshError) {
        console.warn('Failed to refresh tables, but table was created:', refreshError);
        // Don't throw - table was created successfully
      }
      
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Đã tạo bàn mới thành công",
      });
      
      // Navigate back to home screen
      // Use replace to ensure we go back to the main dashboard
      setTimeout(() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/(tabs)");
        }
      }, 1000);
    } catch (error: any) {
      console.error('Create table error:', error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: error.message || "Không thể tạo bàn. Vui lòng thử lại",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedLocation = locationOptions.find((loc) => loc.value === formData.location);
  const selectedStatus = statusOptions.find((stat) => stat.value === formData.status);

  return (
    <SafeAreaView className="flex-1">
      {/* Aurora Background */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 300,
          backgroundColor: selectedLocation?.color || "#667eea",
          opacity: 0.2,
        }}
      />
      <View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "50%",
          height: 300,
          backgroundColor: "#764ba2",
          opacity: 0.15,
        }}
      />

      {/* Header */}
      <View className="px-4 py-4 flex-row items-center justify-between relative z-10">
        <View className="flex-row items-center gap-3">
          <Pressable
            className="rounded-full p-2"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            onPress={() => router.back()}
          >
            <ArrowLeft size={22} color="#fff" />
          </Pressable>
          <Text className="text-2xl font-bold text-white">Tạo bàn mới</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          className="flex-1 px-4 pt-6 pb-8"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {/* Form Card */}
          <View
            className="bg-white rounded-3xl p-6 mb-6"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            {/* Table Number */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-700 mb-2">
                Số bàn *
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-2xl px-4 h-14 text-base"
                style={{
                  borderColor: selectedLocation?.color ? `${selectedLocation.color}30` : "#e9ecef",
                }}
                placeholder="Nhập số bàn (ví dụ: 1, 2, A1)"
                placeholderTextColor="#999"
                value={formData.tableNumber}
                onChangeText={(text) =>
                  setFormData({ ...formData, tableNumber: text })
                }
                editable={!loading}
              />
            </View>

            {/* Seats */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-700 mb-2">
                Số chỗ ngồi *
              </Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 h-14"
                style={{
                  borderColor: selectedLocation?.color ? `${selectedLocation.color}30` : "#e9ecef",
                }}
              >
                <Users size={20} color="#667eea" style={{ marginRight: 12 }} />
                <TextInput
                  className="flex-1 text-base"
                  placeholder="Nhập số chỗ (1-20)"
                  placeholderTextColor="#999"
                  value={formData.seats}
                  onChangeText={(text) =>
                    setFormData({ ...formData, seats: text.replace(/[^0-9]/g, "") })
                  }
                  keyboardType="number-pad"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Location */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-700 mb-3">
                Khu vực *
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {locationOptions.map((location) => (
                  <TouchableOpacity
                    key={location.value}
                    onPress={() =>
                      setFormData({ ...formData, location: location.value })
                    }
                    disabled={loading}
                    className={`rounded-2xl px-5 py-3 flex-row items-center ${
                      formData.location === location.value ? "" : "bg-gray-100"
                    }`}
                    style={
                      formData.location === location.value
                        ? {
                            backgroundColor: location.color,
                            shadowColor: location.color,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 4,
                            elevation: 3,
                          }
                        : {}
                    }
                  >
                    <MapPin
                      size={18}
                      color={formData.location === location.value ? "#fff" : location.color}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      className="font-semibold text-base"
                      style={{
                        color: formData.location === location.value ? "#fff" : location.color,
                      }}
                    >
                      {location.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Status */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-700 mb-3">
                Trạng thái
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {statusOptions.map((status) => (
                  <TouchableOpacity
                    key={status.value}
                    onPress={() =>
                      setFormData({ ...formData, status: status.value })
                    }
                    disabled={loading}
                    className={`rounded-2xl px-5 py-3 ${
                      formData.status === status.value ? "" : "bg-gray-100"
                    }`}
                    style={
                      formData.status === status.value
                        ? {
                            backgroundColor: `${status.color}20`,
                            borderWidth: 2,
                            borderColor: status.color,
                          }
                        : {}
                    }
                  >
                    <Text
                      className="font-semibold text-base"
                      style={{
                        color: formData.status === status.value ? status.color : "#666",
                      }}
                    >
                      {status.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Preview Card */}
          {formData.tableNumber && (
            <View
              className="bg-white rounded-3xl p-6 mb-6"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 5,
                borderLeftWidth: 4,
                borderLeftColor: selectedLocation?.color || "#667eea",
              }}
            >
              <Text className="text-lg font-bold text-gray-900 mb-4">
                Xem trước
              </Text>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base text-gray-600">Số bàn:</Text>
                <Text className="text-xl font-bold text-gray-900">
                  {formData.tableNumber}
                </Text>
              </View>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base text-gray-600">Số chỗ:</Text>
                <View className="flex-row items-center">
                  <Users size={16} color="#667eea" style={{ marginRight: 4 }} />
                  <Text className="text-xl font-bold text-gray-900">
                    {formData.seats || "0"} chỗ
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base text-gray-600">Khu vực:</Text>
                <View
                  className="px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: `${selectedLocation?.color}20` }}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: selectedLocation?.color }}
                  >
                    {selectedLocation?.label}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-base text-gray-600">Trạng thái:</Text>
                <View
                  className="px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: `${selectedStatus?.color}20` }}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: selectedStatus?.color }}
                  >
                    {selectedStatus?.label}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Fixed Bottom Button */}
        <View
          className="px-4 pb-6 pt-4 bg-white border-t"
          style={{
            borderTopColor: "#e9ecef",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <TouchableOpacity
            className={`rounded-2xl py-4 flex-row items-center justify-center ${
              loading ? "opacity-60" : ""
            }`}
            style={{
              backgroundColor: selectedLocation?.color || "#667eea",
              shadowColor: selectedLocation?.color || "#667eea",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Plus size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text className="text-white font-bold text-lg">
                  Tạo bàn
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}




