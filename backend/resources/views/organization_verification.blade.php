<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Bienvenue sur InternFlow - Votre compte entreprise</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f0fdf4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 50px auto; background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #16a34a, #059669); padding: 30px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px; }
        .code-box { background: #f0fdf4; border: 2px dashed #16a34a; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
        .code-box span { font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #16a34a; }
        .company-code { background: #eff6ff; border: 2px solid #3b82f6; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
        .company-code span { font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #2563eb; }
        .button { display: inline-block; background: #16a34a; color: white; padding: 12px 30px; border-radius: 30px; text-decoration: none; margin: 20px 0; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>InternFlow</h1>
            <p>Bienvenue {{ $companyName }} !</p>
        </div>
        <div class="content">
            <h2>Bonjour {{ $name }},</h2>
            <p>Félicitations ! Votre entreprise <strong>{{ $companyName }}</strong> a été inscrite avec succès sur InternFlow.</p>
            
            <div class="company-code">
                <p style="margin-bottom: 10px;"><strong>📋 VOTRE CODE ENTREPRISE UNIQUE</strong></p>
                <span>{{ $companyCode }}</span>
                <p style="margin-top: 10px; font-size: 12px;">Utilisez ce code pour vous connecter à votre espace recruteur</p>
            </div>
            
            <div class="code-box">
                <p><strong>🔐 CODE DE VÉRIFICATION</strong></p>
                <span>{{ $code }}</span>
                <p style="margin-top: 10px; font-size: 12px;">Utilisez ce code pour vérifier votre compte</p>
            </div>
            
            <div class="warning">
                <p><strong>⚠️ Important :</strong></p>
                <p>• Votre code entreprise est unique et vous servira à chaque connexion</p>
                <p>• Conservez-le précieusement</p>
                <p>• Vous pourrez le retrouver dans votre tableau de bord</p>
            </div>
            
            <p>Pour activer votre compte :</p>
            <ol>
                <li>Connectez-vous avec votre email et votre code entreprise</li>
                <li>Entrez le code de vérification à 6 chiffres</li>
                <li>Complétez le profil de votre entreprise</li>
                <li>Commencez à publier des offres de stage</li>
            </ol>
            
            <p>Si vous n'avez pas créé de compte pour cette entreprise, ignorez cet email.</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} InternFlow. Tous droits réservés.</p>
            <p>Recrutez les meilleurs talents étudiants avec InternFlow</p>
        </div>
    </div>
</body>
</html>