import React from "react";
import { Button, Image, View } from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function ImagePickerBox() {
    const [uri, setUri] = React.useState<string | null>(null);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            console.log('Permission denied');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });

        console.log('picker result', result);
        if (result.canceled) return;
        const pickedUri = result.assets?.[0]?.uri ?? null;
        console.log('pickedUri', pickedUri);
        setUri(pickedUri);
    };


    return (
        <View>
            <Button title="Pick image" onPress={pickImage} />
            {uri && <Image source={{ uri }} style={{ width: 120, height: 120 }} />}
        </View>
    );
}

