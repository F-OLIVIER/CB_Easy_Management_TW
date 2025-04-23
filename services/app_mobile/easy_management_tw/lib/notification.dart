// Import
import 'package:flutter/material.dart';

// Fichiers annexes

enum NotificationType { success, error }

void showNotification(
  BuildContext context,
  String message, {
  NotificationType type = NotificationType.success,
  Duration duration = const Duration(seconds: 4),
}) {
  final Color backgroundColor;
  final Icon icon;

  switch (type) {
    case NotificationType.success:
      backgroundColor = Colors.green;
      icon = Icon(Icons.check_circle, color: Colors.white);
      break;
    case NotificationType.error:
      backgroundColor = Colors.red;
      icon = Icon(Icons.cancel, color: Colors.white);
      break;
  }

  final snackBar = SnackBar(
    content: Row(
      children: [
        icon,
        SizedBox(width: 8),
        Expanded(
          child: Text(
            message,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ),
      ],
    ),
    duration: duration,
    backgroundColor: backgroundColor,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
    behavior: SnackBarBehavior.floating,
    elevation: 6,
    margin: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
  );

  if (context.mounted) {
    ScaffoldMessenger.of(context).showSnackBar(snackBar);
  }
}
