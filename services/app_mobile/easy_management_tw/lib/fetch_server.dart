// Import module
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:internet_connection_checker_plus/internet_connection_checker_plus.dart';

// Fichier annexe
import 'package:easy_management_tw/config.dart';
import 'package:easy_management_tw/storage.dart';

Future<Map<String, dynamic>> fetchData({String tofetch = ''}) async {
  if (tofetch.isEmpty) {
    throw Exception(
      'L\'URL de récupération des données ne peut pas être vide (fetchData).',
    );
  }

  // Vérifiez si l'utilisateur a une connexion Internet
  bool isConnected = await InternetConnection().hasInternetAccess;
  if (isConnected == false) {
    return {'Logged': false, 'Internet': false};
  }

  try {
    final data = await readJson();

    final response = await http.post(
      Uri.parse('${Config.serverUrl}$tofetch'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'CodeApp': data['UserInfo']['CodeApp']}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('❌ Erreur lors de la récupération des données');
    }
  } catch (e) {
    throw Exception('❌ Erreur lors de l\'appel au serveur: $e');
  }
}

Future<bool> sendDataToServer({
  required String adresstosend,
  Map<String, dynamic> data = const {},
}) async {
  if (adresstosend.isEmpty || data.isEmpty) {
    throw Exception('❌ L\'URL d\'envoi des données ne peut pas être vide.');
  }

  // print('\n------------------------------------------\ndataToSend $adresstosend :\n $data\n------------------------------------------\n');

  try {
    final response = await http.post(
      Uri.parse('${Config.serverUrl}$adresstosend'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(data),
    );

    if (response.statusCode == 200) {
      return true;
    } else {
      // print('Erreur lors de l\'envoi des données : ${response.statusCode}');
      return false;
    }
  } catch (e) {
    // print('Erreur lors de l\'appel au serveur: $e');
    return false;
  }
}
