// Import
import 'package:flutter/material.dart';

// Fichiers annexes
import 'package:easy_management_tw/config.dart';
import 'package:easy_management_tw/fetch_server.dart';
import 'package:easy_management_tw/common_custom_app.dart';

class Setting extends StatefulWidget {
  const Setting({super.key});

  @override
  State<Setting> createState() => _SettingPage();
}

class _SettingPage extends State<Setting> {
  bool isNotificationEnabled = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: customAppBar(
        context,
        title: Config.language == "fr" ? "Paramètre" : "Setting",
      ),
      drawer: customAppDrawer(context),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 📌 Sélection de la langue
            const Text(
              "Langue",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            DropdownButton<String>(
              value: Config.language,
              items: const [
                DropdownMenuItem(value: "en", child: Text("🇬🇧 English")),
                DropdownMenuItem(value: "fr", child: Text("🇫🇷 Français")),
              ],
              onChanged: (String? newValue) {
                if (newValue != null) {
                  setState(() {
                    Config.language = newValue;
                    Map<String, dynamic> dataToSend = {
                      'CodeApp': Config.codeApp,
                      'Language': newValue,
                    };
                    sendDataToServer(adresstosend: 'setting', data: dataToSend);
                  });
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}
