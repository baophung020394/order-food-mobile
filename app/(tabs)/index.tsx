import { Link } from "expo-router";
import { useState } from "react";
import {
    Dimensions,
    FlatList,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TABLE_STATUS = [
  { key: "all", label: "All", color: "#F57C00" },
  { key: "available", label: "Available", color: "#4CAF50" },
  { key: "reserved", label: "Reserved", color: "#FFB300" },
  { key: "running", label: "Running", color: "#2196F3" },
];

type TableStatus = "available" | "reserved" | "running";

const TABLES = [
  { id: 1, code: "T-01", seats: 4, status: "available" },
  { id: 2, code: "T-02", seats: 2, status: "reserved" },
  { id: 3, code: "T-03", seats: 6, status: "running" },
  { id: 4, code: "T-04", seats: 2, status: "available" },
  { id: 5, code: "T-05", seats: 4, status: "reserved" },
  { id: 6, code: "T-06", seats: 8, status: "available" },
  { id: 7, code: "T-07", seats: 4, status: "running" },
  { id: 8, code: "T-08", seats: 8, status: "available" },
  { id: 9, code: "T-09", seats: 2, status: "reserved" },
  { id: 10, code: "T-10", seats: 4, status: "available" },
  { id: 11, code: "T-11", seats: 2, status: "running" },
  { id: 12, code: "T-12", seats: 6, status: "reserved" },
  { id: 13, code: "T-13", seats: 4, status: "available" },
  { id: 14, code: "T-14", seats: 2, status: "running" },
  { id: 15, code: "T-15", seats: 8, status: "available" },
  { id: 16, code: "T-16", seats: 6, status: "reserved" },
];

const statusColor: Record<TableStatus, string> = {
  available: "#4CAF50",
  reserved: "#FFB300",
  running: "#2196F3",
};
// Số cột grid
const NUM_COLUMNS = 3;
const ITEM_MARGIN = 8;
const SCREEN_WIDTH = Dimensions.get("window").width;
const ITEM_WIDTH =
  (SCREEN_WIDTH - 2 * 12 - (NUM_COLUMNS - 1) * ITEM_MARGIN) / NUM_COLUMNS;

export default function Index() {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<number | null>(null);

  const filteredTables =
    filter === "all" ? TABLES : TABLES.filter((t) => t.status === filter);

  return (
    <SafeAreaView className="flex-1 pb-52">
      <View>
        <Text className="text-2xl font-bold text-black text-center py-6">
          Tables
        </Text>
      </View>
      <View className="flex flex-col bg-[#F8F8F8] pt-4">
        {/* Bộ lọc trạng thái */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 mb-3 flex-row gap-2"
        >
          {TABLE_STATUS.map((st) => (
            <Pressable
              key={st.key}
              onPress={() => setFilter(st.key)}
              style={{
                backgroundColor: filter === st.key ? st.color : "#fff",
                borderColor: st.color,
                borderWidth: 1,
                paddingVertical: 8,
                paddingHorizontal: 20,
                borderRadius: 24,
                marginRight: 8,
              }}
              className="flex items-center"
            >
              <Text
                style={{
                  color: filter === st.key ? "#fff" : st.color,
                  fontWeight: "bold",
                }}
              >
                {st.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        {/* Grid bàn ăn dùng FlatList */}
        <FlatList
          showsHorizontalScrollIndicator={false}
          data={filteredTables}
          renderItem={({ item }) => {
            const isSelected = selected === item.id;
            const borderColor =
              statusColor[item.status as TableStatus] || "#E0E0E0";
            return (
              <Link href={`/table/${item.id}`} asChild>
                <Pressable
                  key={item.id}
                  onPress={() => setSelected(item.id)}
                  style={{
                    width: ITEM_WIDTH,
                    marginBottom: ITEM_MARGIN,
                    marginRight: ITEM_MARGIN,
                    backgroundColor: isSelected ? "#E3F2FD" : "#fff",
                    borderColor: isSelected ? "#1976D2" : borderColor,
                    borderWidth: isSelected ? 3 : 2,
                    borderRadius: 16,
                    alignItems: "center",
                    justifyContent: "center",
                    aspectRatio: 1,
                  }}
                >
                  <Text
                    style={{ color: "#111", fontWeight: "700", fontSize: 18 }}
                  >
                    {item.code}
                  </Text>
                  <Text style={{ color: "#888", fontSize: 13 }}>
                    {item.seats} seats
                  </Text>
                </Pressable>
              </Link>
            );
          }}
          keyExtractor={(item) => String(item.id)}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingBottom: 36,
            paddingTop: 6,
          }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}
