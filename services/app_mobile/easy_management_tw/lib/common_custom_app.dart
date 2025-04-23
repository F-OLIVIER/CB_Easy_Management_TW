// Import
import 'package:flutter/material.dart';

// Fichiers annexes
import 'package:easy_management_tw/config.dart';
import 'package:easy_management_tw/home_not_connected.dart';
import 'package:easy_management_tw/storage.dart';

Future<void> logout(BuildContext context) async {
  await clearStorage();
  if (context.mounted) {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const LoginPage()),
    );
  }
}

AppBar customAppBar(
  BuildContext context, {
  String title = "Easy Management TW",
}) {
  return AppBar(
    title: Text(
      title,
      style: const TextStyle(
        fontWeight: FontWeight.bold,
        fontSize: 24,
        letterSpacing: 1.2,
        color: Colors.white,
      ),
    ),
    centerTitle: true,
    backgroundColor: Colors.transparent,
    elevation: 4,
    iconTheme: IconThemeData(color: Colors.white),
    flexibleSpace: Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Color.fromARGB(230, 63, 85, 116),
            Color.fromARGB(255, 63, 85, 116),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(30),
          bottomRight: Radius.circular(30),
        ),
      ),
    ),
  );
}

Drawer customAppDrawer(BuildContext context) {
  String currentRoute = ModalRoute.of(context)?.settings.name ?? '';

  Widget buildTile(String route, String fr, String en) {
    if (currentRoute == route) return SizedBox.shrink();
    return ListTile(
      title: Text(
        Config.language == "fr" ? fr : en,
        style: TextStyle(fontWeight: FontWeight.bold, color: Colors.black),
      ),
      onTap: () {
        Navigator.pushReplacementNamed(context, route);
      },
    );
  }

  return Drawer(
    child: ListView(
      padding: EdgeInsets.zero,
      children: [
        SizedBox(
          height: 80.0,
          child: DrawerHeader(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Color.fromARGB(255, 63, 85, 116),
                  Color.fromARGB(255, 115, 147, 214),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            margin: EdgeInsets.zero,
            padding: EdgeInsets.zero,
            child: Align(
              alignment: Alignment.center,
              child: Text(
                Config.language == "fr" ? "Menu" : "Menu",
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 26,
                  shadows: [
                    Shadow(
                      offset: Offset(2.0, 2.0),
                      blurRadius: 4.0,
                      color: Colors.black,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
        buildTile('/home', "Accueil", "Home"),
        buildTile('/fichepersonnage', "Fiche personnage", "Character card"),
        buildTile('/caserne', "Caserne", "Barrack"),
        buildTile('/setting', "Paramètres", "Settings"),
        ListTile(
          title: Text(
            Config.language == "fr" ? "Déconnexion" : "Logout",
            style: TextStyle(fontWeight: FontWeight.bold, color: Colors.black),
          ),
          onTap: () async {
            await logout(context);
          },
        ),
      ],
    ),
  );
}
