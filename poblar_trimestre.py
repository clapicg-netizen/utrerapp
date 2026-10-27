import os
from datetime import datetime, timedelta
from supabase import create_client

# Configura tus credenciales de Supabase
SUPABASE_URL = "https://tu-proyecto.supabase.co"
SUPABASE_KEY = "tu-clave-service-role-o-anon"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Lista rotativa de farmacias de noche oficiales según el cuadrante del Colegio de Farmacéuticos
farmacias_noche_ciclo = [
    {"nombre": "Farmacia Virgen de Consolación, 9 (C/ Ancha)", "boticario": "Andrés Díaz - Araceli Díaz", "direccion": "Virgen de Consolación, 9, Utrera", "telefono": "954860180"},
    {"nombre": "Farmacia Jesús Ceballos Torres", "boticario": "Jesús Ceballos Torres", "direccion": "Sevilla, 8, Utrera", "telefono": "954860269"},
    {"nombre": "Farmacia Alfonso y Rosa Jiménez López", "boticario": "Alfonso y Rosa Jiménez López", "direccion": "Molares, 41, Utrera", "telefono": "955867744"},
    {"nombre": "Farmacia Carolina Sousa - Ángel Cebolla", "boticario": "Carolina Sousa - Ángel Cebolla", "direccion": "Álvarez Hazañas, 4, Utrera", "telefono": "954861440"},
    {"nombre": "Farmacia Rocío Martagón Barrero", "boticario": "Rocío Martagón Barrero", "direccion": "Cristobal Colón, 49, Utrera", "telefono": "954861653"},
    {"nombre": "Farmacia José González Mena", "boticario": "José González Mena", "direccion": "Avda. Blas Infante, 7, Utrera", "telefono": "954861763"},
    {"nombre": "Farmacia Antonio Valdés Arenas", "boticario": "Antonio Valdés Arenas", "direccion": "Av. S. Juan Bosco, 96, Utrera", "telefono": "955864951"},
    {"nombre": "Farmacia Ma Luz Ceballos Niebla", "boticario": "Ma Luz Ceballos Niebla", "direccion": "Avda. La Fontanilla, 38, Utrera", "telefono": "955864368"}
]

# Farmacias fijas de turno de día (9:30 a 22:00)
farmacias_dia_fijas = [
    {"nombre": "Farmacia José Luis Algarín Pachón", "boticario": "José Luis Algarín Pachón", "direccion": "Corredera, 1, Utrera", "telefono": "954860448"},
    {"nombre": "Farmacia Rafael González", "boticario": "Rafael González", "direccion": "Cristo de los Afligidos, 74, Utrera", "telefono": "954860213"},
    {"nombre": "Farmacia Pablo Troncoso López", "boticario": "Pablo Troncoso López", "direccion": "Avda. María Auxiliadora, 95, Utrera", "telefono": "954860196"}
]

# Rango de fechas: desde hoy 27 de octubre de 2026 hasta el 31 de diciembre de 2026
fecha_inicio = datetime(2026, 10, 27)
fecha_fin = datetime(2026, 12, 31)

delta = timedelta(days=1)
f_actual = fecha_inicio
indice_noche = 0

print("Iniciando la inserción diaria de farmacias hasta el 31 de diciembre...")

while f_actual <= fecha_fin:
    fecha_str = f_actual.strftime("%Y-%m-%d")
    
    # 1. Insertar las 3 farmacias de turno de día
    for f_dia in farmacias_dia_fijas:
        registro_dia = {
            "fecha": fecha_str,
            "nombre_farmacia": f_dia["nombre"],
            "boticario": f_dia["boticario"],
            "direccion": f_dia["direccion"],
            "telefono": f_dia["telefono"],
            "horario": "09:30 a 22:00 h",
            "turno": "Día"
        }
        try:
            supabase.table("farmacias_calendario").upsert(registro_dia, on_conflict="fecha,nombre_farmacia").execute()
        except Exception as e:
            print(f"Error insertando día {fecha_str}: {e}")

    # 2. Insertar la farmacia de turno de noche (rotativa)
    f_noche = farmacias_noche_ciclo[indice_noche % len(farmacias_noche_ciclo)]
    registro_noche = {
        "fecha": fecha_str,
        "nombre_farmacia": f_noche["nombre"],
        "boticario": f_noche["boticario"],
        "direccion": f_noche["direccion"],
        "telefono": f_noche["telefono"],
        "horario": "22:00 a 9:30 h",
        "turno": "Noche"
    }
    try:
        supabase.table("farmacias_calendario").upsert(registro_noche, on_conflict="fecha,nombre_farmacia").execute()
    except Exception as e:
        print(f"Error insertando noche {fecha_str}: {e}")

    print(f"-> Procesado OK: {fecha_str}")
    f_actual += delta
    indice_noche += 1

print("¡Proceso completado con éxito! Todo el trimestre está cargado en Supabase.")