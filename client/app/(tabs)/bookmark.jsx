import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { translation } from "../../components/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Bookmark = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  const [selectedLang, setSelectedLang] = useState(0);

  useEffect(() => {
    getLang();
  }, []);
  const getLang = async () => {
    setSelectedLang(parseInt(await AsyncStorage.getItem("LANG")));
  };

  // Function to pick an image from the gallery
  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission to access gallery is required!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri); // Store the image URI
    }
  };

  // Function to handle prediction using FastAPI
  const handlePredict = async () => {
    if (!image) {
      alert("Please upload an image first!");
      return;
    }

    setLoading(true); // Show loading spinner while request is in progress
    setPrediction(null); // Clear any previous prediction
    setError(null); // Clear any previous errors

    try {
      // Prepare the image file for uploading using FormData
      const formData = new FormData();
      formData.append("file", {
        uri: image,
        name: "image.jpg", // Image file name
        type: "image/jpeg", // File type
      });

      // Send POST request to the FastAPI server
      const response = await fetch("http://127.0.0.1:8000/predict", {
        // Update this URL to match your FastAPI endpoint
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data", // Tell the server we're sending form data
        },
      });

      const result = await response.json(); // Parse the JSON response from the server

      if (response.ok) {
        setPrediction(result); // Set the prediction result in state
      } else {
        setError(result.message || "An error occurred"); // Handle errors if response is not ok
      }
    } catch (err) {
      setError("An error occurred while sending the request"); // Handle fetch errors
    } finally {
      setLoading(false); // Hide the loading spinner
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-4 py-6">
      <Text className="text-3xl font-semibold text-black mb-6">
        {selectedLang == 0
          ? translation[1].English
          : selectedLang == 1
          ? translation[1].Tamil
          : selectedLang == 2
          ? translation[1].Hindi
          : selectedLang == 3
          ? translation[1].Punjabi
          : selectedLang == 4
          ? translation[1].Urdu
          : null}
      </Text>

      {/* Image Upload Section */}
      <TouchableOpacity
        onPress={pickImage}
        className="border-2 border-dashed border-gray-400 flex items-center justify-center h-48 mb-4 rounded-lg"
      >
        {image ? (
          <Image
            source={{ uri: image }}
            className="w-full h-full rounded-lg object-cover"
          />
        ) : (
          <View className="flex items-center justify-center">
            <Text className="text-gray-400">
              {selectedLang == 0
                ? translation[2].English
                : selectedLang == 1
                ? translation[2].Tamil
                : selectedLang == 2
                ? translation[2].Hindi
                : selectedLang == 3
                ? translation[2].Punjabi
                : selectedLang == 4
                ? translation[2].Urdu
                : null}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Predict Button */}
      <View className="mt-6">
        <TouchableOpacity
          onPress={handlePredict}
          className="bg-green-700 py-4 px-5 rounded-lg"
        >
          <Text className="text-white text-lg text-center">
            {loading ? <ActivityIndicator color="white" /> : "Predict"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Display Prediction Result */}
      {prediction && (
        <View className="mt-6">
          <Text className="text-black text-lg">Prediction Result:</Text>
          <Text className="text-black mt-2">{JSON.stringify(prediction)}</Text>
        </View>
      )}

      {/* Display Error */}
      {error && (
        <View className="mt-6">
          <Text className="text-red-500 text-lg">Error:</Text>
          <Text className="text-red-400 mt-2">{error}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Bookmark;
