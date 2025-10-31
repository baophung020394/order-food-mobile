import { images } from "@/constants/images";
import { useRouter } from "expo-router";
import { CheckSquare, ChefHat, Lock, Square, User } from "lucide-react-native";
import React, { useState } from "react";

import {
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const SignIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const router = useRouter();

  return (
    <ImageBackground
      source={images.restaurant}
      className="flex-1 justify-center items-center w-full"
      resizeMode="cover"
    >
      <View className="bg-[#2E7D32] rounded-2xl px-10 py-12 items-center w-[340px] shadow-lg shadow-black/10">
        <View className="items-center mb-9">
          <View className="w-16 h-16 rounded-full bg-white items-center justify-center">
            <ChefHat className=" text-white" size={32} />
          </View>
          <View>
            <Text className="text-2xl font-bold text-white font-sans">
              DineFlow
            </Text>
            <Text className="mt-1 text-[#E0E0E0] text-base font-sans tracking-wide">
              Staff Access
            </Text>
          </View>
        </View>

        {/* Username Field */}
        <View className="flex-row items-center bg-white rounded-xl w-full h-14 mb-5 px-4 shadow shadow-black/5">
          <User color="#888" size={20} />
          <TextInput
            className="ml-2 flex-1 text-base text-[#333] font-sans"
            placeholder="Username"
            placeholderTextColor="#888"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        {/* Password Field */}
        <View className="flex-row items-center bg-white rounded-xl w-full h-14 mb-8 px-4 shadow shadow-black/5">
          <Lock color="#888" size={20} />
          <TextInput
            className="ml-2 flex-1 text-base text-[#333] font-sans"
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity
          onPress={() => router.push("/(tabs)")}
          className="bg-[#F57C00] rounded-xl h-14 w-full items-center justify-center mt-2 shadow-lg shadow-orange-400/20"
        >
          <Text className="text-white text-lg font-bold font-sans">
            Sign In
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-between items-center w-full mt-7">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => setRemember(!remember)}
            activeOpacity={0.7}
          >
            {remember ? (
              <CheckSquare color="#fff" size={18} />
            ) : (
              <Square color="#fff" size={18} />
            )}
            <Text className="ml-2 text-white text-sm font-sans">
              Remember me
            </Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text className="text-sm text-white underline font-sans">
              Forgot password?
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

export default SignIn;
