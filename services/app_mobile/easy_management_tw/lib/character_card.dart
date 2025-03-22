// import
import 'dart:convert';
import 'package:flutter/material.dart';

// Fichiers annexes
import 'package:easy_management_tw/config.dart';
import 'package:easy_management_tw/common_custom_app.dart';
import 'package:easy_management_tw/fetch_server.dart';
import 'package:easy_management_tw/notification.dart';

class FichePersonnagePage extends StatefulWidget {
  const FichePersonnagePage({super.key});

  @override
  FichePersonnagePageState createState() => FichePersonnagePageState();
}

class FichePersonnagePageState extends State<FichePersonnagePage> {
  TextEditingController? levelController;
  TextEditingController? influenceController;
  List<String> classList = [];
  String? actualClass;
  String? selectedClass;
  int? userLevel;
  int? userInfluence;

  @override
  void initState() {
    super.initState();
    _initializeCharacterData();
  }

  Future<void> _initializeCharacterData() async {
    try {
      final userData = await fetchData(tofetch: 'user');
      // print('---------------------------------');
      // print('userData : $userData');
      // print('---------------------------------');

      if (userData['Internet'] != null && userData['Internet'] == false) {
        if (mounted) {
          Navigator.pushReplacementNamed(context, '/no_internet');
        }
        return;
      }

      if (userData['Gestion']['Logged'] == false && mounted) {
        await logout(context);
        return;
      }

      setState(() {
        Config.language = userData['UserInfo']?['Language'];

        // Initialisation des niveaux et influence
        userLevel = _parseInt(userData['UserInfo']?['Lvl']);
        userInfluence = _parseInt(userData['UserInfo']?['Influence']);

        // Traitement des classes
        classList = _processClassList(userData['Gestion']?['ListClass']);
        // print('classList : $classList');

        // Classe actuelle
        actualClass = _processSelectedClass(userData);
        classList.remove(actualClass);
        selectedClass =
            Config.language == "fr" ? "Changer de classe" : "Change class";

        // Initialisation des contrôleurs de texte
        levelController = TextEditingController(text: '');
        influenceController = TextEditingController(text: '');

        Config.codeApp = userData['UserInfo']?['CodeApp'];
      });
    } catch (e) {
      // print("Erreur lors de la récupération des données : $e");
    }
  }

  // Fonction utilitaire pour parser les entiers
  int _parseInt(dynamic value) {
    return int.tryParse(value?.toString() ?? '') ?? 0;
  }

  // Fonction pour traiter et nettoyer la liste des classes
  List<String> _processClassList(dynamic listClassData) {
    if (listClassData is List<dynamic>) {
      // Ajouter "Changer de classe" au début
      var processedList = <String>[
        Config.language == "fr" ? "Changer de classe" : "Change class",
      ];

      // Ajouter les autres classes selon la langue choisie
      for (var item in listClassData) {
        if (item is Map<String, dynamic> && item.containsKey(Config.language)) {
          try {
            var rawValue = item[Config.language];
            if (rawValue != null) {
              // Convertir en UTF-8 pour éviter les caractères mal encodés
              List<int> bytes = rawValue.toString().codeUnits;
              String decoded = utf8.decode(bytes, allowMalformed: true);
              processedList.add(decoded);
            }
          } catch (e) {
            // print("Erreur de conversion UTF-8 : $e");
          }
        }
      }

      // Retirer les doublons et retourner la liste
      return processedList.toSet().toList();
    }
    return [];
  }

  // Fonction pour récupérer et traiter la classe actuelle
  String _processSelectedClass(Map<String, dynamic> userData) {
    var rawValue = userData['UserInfo']?['GameCharacter'][Config.language];

    if (rawValue != null && rawValue is String) {
      try {
        // Encodage en Latin-1 et décodage en UTF-8 pour corriger l'affichage
        List<int> bytes = latin1.encode(rawValue);
        return utf8.decode(bytes);
      } catch (e) {
        // print("Erreur de conversion UTF-8: $e");
        return rawValue; // Retourne la valeur brute en cas d'erreur
      }
    }

    return Config.language == "fr" ? "Non défini" : "Not defined";
  }

  // Fonction de mise à jour de tous les champs
  void _updateAll() async {
    // Récupération des valeurs
    int? level = int.tryParse(levelController?.text ?? '');
    int? influence = int.tryParse(influenceController?.text ?? '');

    // Pour le serveur
    Map<String, dynamic> dataToSend = {'CodeApp': Config.codeApp};

    // Vérifier si tous les champs sont vides ou invalides
    if ((level == null) && (influence == null) && (selectedClass == null)) {
      // Si tous les champs sont vides ou invalides, ne faire aucune mise à jour
      showErrorNotification(context, 'Aucun champs modifier !');
      return;
    }
    if ((level != null && (level <= 0 || level > 10000))) {
      // Si tous les champs sont vides ou invalides, ne faire aucune mise à jour
      showErrorNotification(
        context,
        Config.language == "fr" ? "Level incorrect" : "Wrong level",
      );
      return;
    }
    if ((influence != null && (influence < 700 || influence > 1000))) {
      // Si tous les champs sont vides ou invalides, ne faire aucune mise à jour
      showErrorNotification(
        context,
        Config.language == "fr" ? "Influence incorrect" : "Wrong influence",
      );
      return;
    }

    // Si des valeurs sont valides, on les met à jour.
    if (level != null) {
      userLevel = level;
      dataToSend['Lvl'] = level.toString();
    }

    if (influence != null) {
      userInfluence = influence;
      dataToSend['Influence'] = influence.toString();
    }

    if (selectedClass != null && selectedClass != 'Changer de classe') {
      // S'assure que GameCharacter n'ai pas null
      dataToSend['GameCharacter'] ??= {};
      dataToSend['GameCharacter'][Config.language] = selectedClass.toString();
    }

    // Ajout de la langue
    dataToSend['Language'] = Config.language;

    // print('\n---------------------------------\ndataToSend : $dataToSend');

    // Envoi des modification à faire au serveur
    bool? sendok;
    if (dataToSend.isNotEmpty) {
      sendok = await sendDataToServer(
        adresstosend: 'updatecharactercard',
        data: dataToSend,
      );
    }

    // Affichage de la notification
    if (mounted) {
      if (sendok == true) {
        showSuccessNotification(
          context,
          Config.language == "fr"
              ? "Changement validés avec succées !"
              : "Changes successfully validated!",
        );
        Navigator.pushNamed(context, '/fichepersonnage');
      } else {
        showErrorNotification(
          context,
          "Erreur interne, contactez un administrateur",
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: customAppBar(
        context,
        title: Config.language == "fr" ? "Fiche personnage" : "Character card",
      ),
      drawer: customAppDrawer(context),
      backgroundColor: Color.fromARGB(255, 115, 147, 214),
      body:
          classList == []
              ? const Center(child: CircularProgressIndicator())
              : Padding(
                padding: const EdgeInsets.all(16.0),
                child: ListView(
                  children: [
                    // Section Classe
                    Card(
                      elevation: 4,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              Config.language == "fr"
                                  ? 'Classe actuel :\n${actualClass ?? 'Non défini'}'
                                  : 'Current class :\n${actualClass ?? 'Not Defined'}',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 10),
                            DropdownButton<String>(
                              value: selectedClass,
                              onChanged: (String? newClass) {
                                setState(() {
                                  selectedClass = newClass;
                                });
                              },
                              items:
                                  classList.map<DropdownMenuItem<String>>((
                                    className,
                                  ) {
                                    return DropdownMenuItem<String>(
                                      value: className,
                                      child: Text(className),
                                    );
                                  }).toList(),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 10),

                    // Section Level de héros
                    Card(
                      elevation: 4,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              Config.language == "fr"
                                  ? 'Level actuel : $userLevel'
                                  : 'Current level : $userLevel',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 10),
                            TextField(
                              controller: levelController,
                              keyboardType: TextInputType.number,
                              decoration: InputDecoration(
                                labelText:
                                    Config.language == "fr"
                                        ? 'Changer de level'
                                        : 'Change level',
                                hintText:
                                    Config.language == "fr"
                                        ? 'Entrez votre nouveau level'
                                        : 'Enter your new level',
                                border: OutlineInputBorder(),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(5),
                                  borderSide: const BorderSide(
                                    color: Colors.black,
                                    width: 2,
                                  ),
                                ),
                                contentPadding: EdgeInsets.symmetric(
                                  vertical: 10,
                                  horizontal: 15,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 10),

                    // Section Influence
                    Card(
                      elevation: 4,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              Config.language == "fr"
                                  ? 'Influence actuelle : $userInfluence'
                                  : 'Current influence : $userInfluence',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 10),
                            TextField(
                              controller: influenceController,
                              keyboardType: TextInputType.number,
                              decoration: InputDecoration(
                                labelText:
                                    Config.language == "fr"
                                        ? 'Changer d\'influence'
                                        : 'Changing influence',
                                hintText:
                                    Config.language == "fr"
                                        ? 'Entrez votre nouvelle influence'
                                        : 'Enter your new influence',
                                border: OutlineInputBorder(),
                                contentPadding: EdgeInsets.symmetric(
                                  vertical: 10,
                                  horizontal: 15,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Bouton pour mettre à jour tous les champs
                    ElevatedButton(
                      onPressed: _updateAll,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        padding: EdgeInsets.zero,
                      ),
                      child: Ink(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              Colors.blue.shade400,
                              Colors.blue.shade900,
                            ],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(30),
                        ),
                        child: Container(
                          alignment: Alignment.center,
                          constraints: const BoxConstraints(
                            minWidth: 150,
                            minHeight: 50,
                          ),
                          child: Text(
                            Config.language == "fr"
                                ? 'Valider les changements'
                                : 'Validating changes',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
    );
  }
}
