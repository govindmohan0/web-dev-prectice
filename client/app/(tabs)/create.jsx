import React, { useState, useEffect } from "react";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Alert, TouchableOpacity, Image } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { icons } from "../../constants";
import { createImagePost } from "../../lib/appwrite";
import { CustomButton, FormField } from "../../components";
import { useGlobalContext } from "../../context/GlobalProvider";

const Create = () => {
  const { user } = useGlobalContext();
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    image: null,
    prompt: "",
  });

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Permission to access media is required!"
      );
    }
  };

  const openPicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setForm({
        ...form,
        image: result.uri || result.assets[0]?.uri, // Updated to handle new API structure
      });
    } else {
      Alert.alert("No image selected");
    }
  };

  const [selectedLang, setSelectedLang] = useState(0);

  useEffect(() => {
    getLang();
  }, []);

  const getLang = async () => {
    const lang = await AsyncStorage.getItem("LANG");
    setSelectedLang(parseInt(lang, 10));
  };

  const submit = async () => {
    if (form.prompt === "" || form.title === "" || !form.image) {
      return Alert.alert("Please provide all fields");
    }

    setUploading(true);
    try {
      await createImagePost({
        ...form,
        userId: user.$id,
        imageUrl: form.image,
      });

      Alert.alert("Success", "Image post uploaded successfully");
      router.push("/home");
    } catch (error) {
      Alert.alert("Error", error?.message || "An error occurred");
    } finally {
      setForm({
        title: "",
        image: null,
        prompt: "",
      });

      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: "white", flex: 1 }}>
      <View style={{ padding: 16, marginTop: 24 }}>
        <Text
          style={{
            fontSize: 24,
            color: "black",
            fontWeight: "600",
            marginBottom: 16,
          }}
        >
          Upload Image
        </Text>
        <FormField
          title="Image Title"
          value={form.title}
          placeholder="Give your image a catchy title..."
          handleChangeText={(e) => setForm({ ...form, title: e })}
          otherStyles={{ marginTop: 10 }}
          color="black"
        />

        <View style={{ marginTop: 28 }}>
          <Text style={{ fontSize: 16, color: "black", fontWeight: "500" }}>
            Upload Image
          </Text>
          <TouchableOpacity onPress={openPicker}>
            {form.image ? (
              <Image
                source={{ uri: form.image }}
                resizeMode="cover"
                style={{
                  width: "100%",
                  height: 256,
                  borderRadius: 16,
                  marginTop: 16,
                }}
              />
            ) : (
              <View
                style={{
                  width: "100%",
                  height: 160,
                  padding: 16,
                  backgroundColor: "#f0f0f0",
                  borderRadius: 16,
                  borderColor: "#ccc",
                  borderWidth: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderColor: "#ddd",
                    borderWidth: 1,
                    borderStyle: "dashed",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={icons.upload}
                    resizeMode="contain"
                    style={{ width: "50%", height: "50%" }}
                  />
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <CustomButton
          title="Submit & Publish"
          handlePress={submit}
          containerStyles="mt-7"
          isLoading={uploading}
        />
      </View>
    </SafeAreaView>
  );
};

export default Create;