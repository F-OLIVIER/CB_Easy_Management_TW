// Import module
import 'dart:convert';
import 'dart:io';
import 'package:path_provider/path_provider.dart';

// Fichier annexe

// Obtenir le chemin du fichier local du cache
Future<File> getLocalFile() async {
  final directory = await getApplicationDocumentsDirectory();
  return File('${directory.path}/datalnb.json');
}

// Écrire les données JSON du cache
Future<void> writeJson(Map<String, dynamic> data) async {
  try {
    final file = await getLocalFile();
    await file.writeAsString(jsonEncode(data));
  } catch (e) {
    // print("❌ Erreur lors de l'écriture du fichier JSON : $e");
  }
}

// Lire les données JSON du cache
Future<Map<String, dynamic>> readJson() async {
  try {
    final file = await getLocalFile();
    if (await file.exists()) {
      final content = await file.readAsString();
      return jsonDecode(content);
    }
  } catch (e) {
    // print('❌ Erreur lors de la lecture du fichier : $e');
  }
  return {};
}

// Supprimer le fichier JSON dans le cache
Future<void> clearStorage() async {
  final file = await getLocalFile();
  if (await file.exists()) {
    await file.delete();
  }
}
