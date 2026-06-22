<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Vérification de compte - InternFlow</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f0fdf4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 50px auto; background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #16a34a, #059669); padding: 30px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px; }
        .code { background: #f0fdf4; border: 2px dashed #16a34a; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
        .code span { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #16a34a; }
        .button { display: inline-block; background: #16a34a; color: white; padding: 12px 30px; border-radius: 30px; text-decoration: none; margin: 20px 0; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>InternFlow</h1>
            <p>Vérification de compte</p>
        </div>
        <div class="content">
            <h2>Bonjour {{ $name }} !</h2>
            <p>Merci de vous être inscrit sur InternFlow. Pour activer votre compte, veuillez utiliser le code de vérification ci-dessous :</p>
            
            <div class="code">
                <span>{{ $code }}</span>
            </div>
            
            <p>Ce code est valable pendant 24 heures.</p>
            
            <p>Si vous n'avez pas créé de compte sur InternFlow, ignorez cet email.</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} InternFlow. Tous droits réservés.</p>
            <p>Cette plateforme connecte les étudiants avec les meilleures opportunités de stage.</p>
        </div>
    </div>
</body>
</html>