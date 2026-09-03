import * as ImagePicker from "expo-image-picker";
import { Directory, File, Paths } from "expo-file-system";
import { makeId } from "../db/database";

export type PhotoSource = "camera" | "library";

export const persistLocalPhoto = async (uri: string): Promise<string> => {
  try {
    const directory = new Directory(Paths.document, "puppysteps-photos");
    directory.create({ intermediates: true, idempotent: true });
    const source = new File(uri);
    const rawExtension = source.extension || ".jpg";
    const extension = rawExtension.startsWith(".") ? rawExtension : `.${rawExtension}`;
    const destination = new File(directory, `${makeId("photo")}${extension}`);
    await source.copy(destination);
    return destination.uri;
  } catch (error) {
    console.warn("Could not copy attached photo", error);
    return uri;
  }
};

export const pickLocalPhoto = async (source: PhotoSource): Promise<string | null> => {
  const permission = source === "camera"
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;
  const result = source === "camera"
    ? await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [4, 3], quality: 0.8 })
    : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [4, 3], quality: 0.8 });
  const uri = result.canceled ? null : result.assets?.[0]?.uri;
  return uri ? persistLocalPhoto(uri) : null;
};
