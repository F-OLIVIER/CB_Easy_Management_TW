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

  Widget buildMainContent(BuildContext context, double screenHeight) {
    return Padding(
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

          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(5),
              boxShadow: [
                BoxShadow(
                  color: Colors.black26,
                  spreadRadius: 1,
                  blurRadius: 4,
                ),
              ],
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: Config.language,
                items: const [
                  DropdownMenuItem(
                    value: "en",
                    child: Padding(
                      padding: EdgeInsets.only(left: 16.0),
                      child: Text("🇬🇧 English"),
                    ),
                  ),
                  DropdownMenuItem(
                    value: "fr",
                    child: Padding(
                      padding: EdgeInsets.only(left: 16.0),
                      child: Text("🇫🇷 Français"),
                    ),
                  ),
                ],
                onChanged: (String? newValue) {
                  if (newValue != null) {
                    setState(() {
                      Config.language = newValue;
                      Map<String, dynamic> dataToSend = {
                        'CodeApp': Config.codeApp,
                        'Language': newValue,
                      };
                      sendDataToServer(
                        adresstosend: 'setting',
                        data: dataToSend,
                      );
                    });
                  }
                },
                isExpanded: true,
                style: TextStyle(color: Colors.black),
                iconEnabledColor: Colors.black,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    double screenWidth = MediaQuery.of(context).size.width;
    double screenHeight = MediaQuery.of(context).size.height;

    return Scaffold(
      appBar: customAppBar(
        context,
        title: Config.language == "fr" ? "Paramétres" : "Settings",
      ),
      drawer: screenWidth <= 700 ? customAppDrawer(context) : null,
      backgroundColor: Color.fromARGB(255, 115, 147, 214),
      body:
          screenWidth > 700
              ? Row(
                children: [
                  customAppDrawer(context),
                  Expanded(
                    child: Align(
                      alignment: Alignment.topLeft,
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: buildMainContent(context, screenHeight),
                      ),
                    ),
                  ),
                ],
              )
              : Center(
                child: LayoutBuilder(
                  builder: (context, constraints) {
                    return buildMainContent(context, constraints.maxHeight);
                  },
                ),
              ),
    );
  }
}
