// Banco del parcial de Programación Hipermedia (20 fichas). Cada ficha trae su enunciado, la solución en C#,
// el ejemplo visible (prueba 1) y 4 pruebas ocultas. Las salidas esperadas las calcula construir.js ejecutando la solución.
// nivel 1 = intermedio (★), nivel 2 = reto (★★). `etiquetas` son los prefijos de las líneas de resultado que se comparan.

module.exports = [
{
  n: 1, nivel: 1, titulo: 'El pasaje', empresa: 'Transporte masivo',
  historia: 'Un sistema de transporte masivo necesita calcular cuánto paga cada pasajero. El pasaje normal vale 3000.',
  reglas: [
    {
      "tabla": {
        "cab": [
          "Pasajero",
          "Paga"
        ],
        "filas": [
          [
            "Menor de 5 años, o de 65 años o más",
            "Nada: viaja gratis"
          ],
          [
            "Estudiante",
            "La mitad del pasaje normal"
          ],
          [
            "Cualquier otro pasajero",
            "El pasaje normal: 3000"
          ]
        ]
      }
    },
    {
      "tabla": {
        "cab": [
          "Hora del día",
          "Recargo"
        ],
        "filas": [
          [
            "6, 7 y 8 (de 6:00 a 8:59)",
            "20% de lo que le toca pagar"
          ],
          [
            "17 y 18 (de 17:00 a 18:59)",
            "20% de lo que le toca pagar"
          ],
          [
            "Cualquier otra hora",
            "Sin recargo"
          ]
        ]
      }
    },
    "Quien viaja gratis no paga nada, ni siquiera en hora pico.",
    {
      "pista": {
        "titulo": "Cómo se calcula un recargo",
        "formula": "El 20% de un valor es: valor × 20 ÷ 100",
        "ejemplo": "Si a alguien le tocaba pagar 2000, el recargo del 20% son 400."
      }
    }
  ],
  entradas: ['La edad', 'Si es estudiante (1 = sí, 2 = no)', 'La hora del día (de 0 a 23)'],
  salidas: ['Pasaje: <valor>'],
  etiquetas: ['Pasaje:'],
  ejemplo: [20, 1, 7],
  pruebas: [[30, 2, 8], [4, 1, 8], [5, 2, 19], [64, 1, 17]],
  sol: `Console.WriteLine("Edad:");
int edad = int.Parse(Console.ReadLine());
Console.WriteLine("¿Es estudiante? (1 = sí, 2 = no)");
int estudiante = int.Parse(Console.ReadLine());
Console.WriteLine("Hora del día (0 a 23):");
int hora = int.Parse(Console.ReadLine());

int pasaje = 3000;

if (edad < 5 || edad >= 65)
{
    pasaje = 0;
}
else
{
    if (estudiante == 1)
    {
        pasaje = pasaje / 2;
    }

    if ((hora >= 6 && hora < 9) || (hora >= 17 && hora < 19))
    {
        pasaje = pasaje + pasaje * 20 / 100;
    }
}

Console.WriteLine("Pasaje: " + pasaje);`
},
{
  n: 2, nivel: 1, titulo: 'La nómina semanal', empresa: 'Taller de confecciones',
  historia: 'Un pequeño taller de confecciones necesita calcular el pago semanal de cada empleado a partir de las horas trabajadas y del valor de la hora.',
  reglas: [
    {
      "tabla": {
        "cab": [
          "Horas de la semana",
          "Cada hora se paga a"
        ],
        "filas": [
          [
            "De la hora 1 a la 40",
            "El valor de la hora"
          ],
          [
            "Desde la hora 41 (horas extra)",
            "1,5 veces el valor de la hora"
          ]
        ]
      }
    },
    "Bruto es lo que gana el empleado por sus horas, antes de descuentos. Neto a pagar es lo que finalmente recibe.",
    "Del bruto se descuenta el 8% por salud y pensión.",
    "Auxilio de transporte: si después del descuento al empleado le quedan menos de 400000, la empresa le agrega 50000. Si le quedan 400000 o más, el auxilio es 0.",
    {
      "pista": {
        "titulo": "Cómo se calcula el descuento",
        "formula": "El 8% de un valor es: valor × 8 ÷ 100",
        "ejemplo": "El 8% de 200000 es 16000."
      }
    }
  ],
  entradas: ['Las horas trabajadas en la semana', 'El valor de la hora (siempre un múltiplo de 100)'],
  salidas: ['Bruto: <valor>', 'Descuento: <valor>', 'Auxilio: <valor>', 'Neto a pagar: <valor>'],
  etiquetas: ['Bruto:', 'Descuento:', 'Auxilio:', 'Neto a pagar:'],
  ejemplo: [45, 10000],
  pruebas: [[40, 8000], [30, 15000], [0, 10000], [40, 10500]],
  sol: `Console.WriteLine("Horas trabajadas:");
int horas = int.Parse(Console.ReadLine());
Console.WriteLine("Valor de la hora:");
int valorHora = int.Parse(Console.ReadLine());

int normales = horas;
int extras = 0;

if (horas > 40)
{
    normales = 40;
    extras = horas - 40;
}

int bruto = normales * valorHora + extras * valorHora * 3 / 2;
int descuento = bruto * 8 / 100;
int neto = bruto - descuento;
int auxilio = 0;

if (neto < 400000)
{
    auxilio = 50000;
}

Console.WriteLine("Bruto: " + bruto);
Console.WriteLine("Descuento: " + descuento);
Console.WriteLine("Auxilio: " + auxilio);
Console.WriteLine("Neto a pagar: " + (neto + auxilio));`
},
{
  n: 3, nivel: 1, titulo: 'Divisores y números perfectos', empresa: 'Colegio',
  historia: 'La profesora de matemáticas de un colegio quiere un programa que clasifique cualquier número entero positivo para usarlo en clase.',
  reglas: [
    "Divisor de n: número que cabe exacto en n, sin dejar residuo. Se cuentan el 1 y el propio n.",
    {
      "ejemplo": "Los divisores de 10 son 1, 2, 5 y 10."
    },
    "Primo: tiene exactamente 2 divisores (el 1 y él mismo). El 5 es primo.",
    "Perfecto: si sumas sus divisores sin contar el propio número, obtienes el mismo número.",
    {
      "ejemplo": "El 6 es perfecto: sus divisores menores que él son 1, 2 y 3, y 1 + 2 + 3 = 6."
    }
  ],
  entradas: ['Un número entero positivo'],
  salidas: ['Divisores: <cantidad>', 'Primo: Sí  o  Primo: No', 'Perfecto: Sí  o  Perfecto: No'],
  etiquetas: ['Divisores:', 'Primo:', 'Perfecto:'],
  ejemplo: [6],
  pruebas: [[1], [7], [28], [12]],
  sol: `Console.WriteLine("Número:");
int n = int.Parse(Console.ReadLine());

int cantidad = 0;
int suma = 0;

for (int i = 1; i <= n; i++)
{
    if (n % i == 0)
    {
        cantidad++;

        if (i < n)
        {
            suma = suma + i;
        }
    }
}

Console.WriteLine("Divisores: " + cantidad);

if (cantidad == 2)
{
    Console.WriteLine("Primo: Sí");
}
else
{
    Console.WriteLine("Primo: No");
}

if (suma == n)
{
    Console.WriteLine("Perfecto: Sí");
}
else
{
    Console.WriteLine("Perfecto: No");
}`
},
{
  n: 4, nivel: 1, titulo: 'El panel de jueces', empresa: 'Federación de gimnasia',
  historia: 'En una competencia de gimnasia, 5 jueces califican a cada atleta con un puntaje de 0 a 10. Para evitar favoritismos, de los 5 puntajes se descarta el más alto y el más bajo.',
  reglas: [
    "Cada uno de los 5 jueces califica con un puntaje de 0 a 10. Si un puntaje está fuera de ese rango, se le vuelve a pedir a ese mismo juez.",
    "Para evitar favoritismos, no cuentan el puntaje más alto ni el más bajo. La nota final es la suma de los 3 puntajes que sí cuentan.",
    "Si el más alto (o el más bajo) está repetido, solo se descarta uno de ellos.",
    {
      "ejemplo": "Puntajes 7, 9, 5, 9, 8: se descartan un 9 y el 5. Cuentan el 7, el 9 y el 8."
    }
  ],
  entradas: ['El puntaje de cada uno de los 5 jueces, uno tras otro'],
  salidas: ['Descartados: mayor <puntaje>, menor <puntaje>', 'Nota final: <valor>'],
  etiquetas: ['Descartados:', 'Nota final:'],
  ejemplo: [8, 9, 7, 10, 6],
  pruebas: [[9, 9, 9, 9, 9], [12, 3, 10, 7, -2, 10, 1], [0, 0, 0, 0, 0], [10, 10, 0, 0, 5]],
  sol: `int suma = 0;
int mayor = 0;
int menor = 10;

for (int juez = 1; juez <= 5; juez++)
{
    int puntaje;

    do
    {
        Console.WriteLine("Puntaje del juez " + juez + " (0 a 10):");
        puntaje = int.Parse(Console.ReadLine());
    }
    while (puntaje < 0 || puntaje > 10);

    suma = suma + puntaje;

    if (puntaje > mayor)
    {
        mayor = puntaje;
    }

    if (puntaje < menor)
    {
        menor = puntaje;
    }
}

Console.WriteLine("Descartados: mayor " + mayor + ", menor " + menor);
Console.WriteLine("Nota final: " + (suma - mayor - menor));`
},
{
  n: 5, nivel: 1, titulo: 'El cronómetro del maratón', empresa: 'Organización de carreras',
  historia: 'Los organizadores de una maratón reciben el tiempo de cada corredor en segundos y necesitan publicarlo en formato de reloj, además de clasificarlo.',
  reglas: [
    {
      "tabla": {
        "cab": [
          "Dato",
          "Cómo se muestra"
        ],
        "filas": [
          [
            "Tiempo",
            "horas:minutos:segundos, por ejemplo 2:05:09 o 0:45:30"
          ],
          [
            "Minutos y segundos",
            "Siempre con dos cifras (05, no 5)"
          ],
          [
            "Horas",
            "Sin cero a la izquierda"
          ]
        ]
      }
    },
    {
      "tabla": {
        "cab": [
          "Tiempo del corredor",
          "Categoría"
        ],
        "filas": [
          [
            "Menos de 2 horas y 30 minutos",
            "Élite"
          ],
          [
            "2 horas y 30 minutos o más",
            "General"
          ]
        ]
      }
    }
  ],
  entradas: ['El tiempo total del corredor, en segundos'],
  salidas: ['Tiempo: <h>:<mm>:<ss>', 'Categoría: Élite  o  Categoría: General'],
  etiquetas: ['Tiempo:', 'Categoría:'],
  ejemplo: [3909],
  pruebas: [[9000], [8999], [59], [14400]],
  sol: `Console.WriteLine("Tiempo en segundos:");
int total = int.Parse(Console.ReadLine());

int horas = total / 3600;
int minutos = total % 3600 / 60;
int segundos = total % 60;

string textoMinutos = "" + minutos;
string textoSegundos = "" + segundos;

if (minutos < 10)
{
    textoMinutos = "0" + minutos;
}

if (segundos < 10)
{
    textoSegundos = "0" + segundos;
}

Console.WriteLine("Tiempo: " + horas + ":" + textoMinutos + ":" + textoSegundos);

if (total < 9000)
{
    Console.WriteLine("Categoría: Élite");
}
else
{
    Console.WriteLine("Categoría: General");
}`
},
{
  n: 6, nivel: 1, titulo: 'La encuesta de satisfacción', empresa: 'Cadena de restaurantes',
  historia: 'Una cadena de restaurantes encuesta a sus clientes: cada uno califica el servicio de 1 a 5. La gerencia quiere saber qué porcentaje de clientes quedó satisfecho.',
  reglas: [
    {
      "tabla": {
        "cab": [
          "Calificación",
          "El cliente queda"
        ],
        "filas": [
          [
            "1 o 2",
            "Insatisfecho"
          ],
          [
            "3",
            "Neutral"
          ],
          [
            "4 o 5",
            "Satisfecho"
          ]
        ]
      }
    },
    "Cuántos clientes respondieron: al menos 1 (si no, se vuelve a preguntar). Una calificación fuera de 1 a 5 se vuelve a pedir al mismo cliente y no cuenta como un cliente más.",
    "El porcentaje de cada grupo es la parte del total de clientes que ese grupo representa.",
    {
      "tabla": {
        "cab": [
          "Satisfechos",
          "Resultado"
        ],
        "filas": [
          [
            "80% o más",
            "Excelente"
          ],
          [
            "De 50% a menos de 80%",
            "Aceptable"
          ],
          [
            "Menos de 50%",
            "Crítico"
          ]
        ]
      }
    },
    "Para decidir el resultado se usa el porcentaje de satisfechos ya sin decimales. Por eso los tres porcentajes pueden no sumar 100.",
    {
      "pista": {
        "titulo": "Cómo se calcula un porcentaje",
        "formula": "El porcentaje de un grupo es: cantidad del grupo × 100 ÷ total de clientes",
        "ejemplo": "3 satisfechos de 8 clientes: 3 × 100 ÷ 8 = 37%."
      }
    }
  ],
  entradas: ['Cuántos clientes respondieron', 'La calificación de cada cliente, uno tras otro'],
  salidas: ['Satisfechos: <n>%', 'Neutrales: <n>%', 'Insatisfechos: <n>%', 'Resultado: Excelente  o  Aceptable  o  Crítico'],
  etiquetas: ['Satisfechos:', 'Neutrales:', 'Insatisfechos:', 'Resultado:'],
  ejemplo: [5, 5, 4, 3, 2, 5],
  pruebas: [[1, 5], [10, 5, 5, 4, 4, 4, 5, 4, 5, 3, 2], [3, 9, 4, 0, 5, 1], [4, 1, 2, 3, 5]],
  sol: `int total;

do
{
    Console.WriteLine("¿Cuántos clientes respondieron?");
    total = int.Parse(Console.ReadLine());
}
while (total < 1);

int satisfechos = 0;
int neutrales = 0;
int insatisfechos = 0;

for (int i = 1; i <= total; i++)
{
    int calificacion;

    do
    {
        Console.WriteLine("Calificación del cliente " + i + " (1 a 5):");
        calificacion = int.Parse(Console.ReadLine());
    }
    while (calificacion < 1 || calificacion > 5);

    if (calificacion >= 4)
    {
        satisfechos++;
    }
    else if (calificacion == 3)
    {
        neutrales++;
    }
    else
    {
        insatisfechos++;
    }
}

int porcentajeSatisfechos = satisfechos * 100 / total;
int porcentajeNeutrales = neutrales * 100 / total;
int porcentajeInsatisfechos = insatisfechos * 100 / total;

Console.WriteLine("Satisfechos: " + porcentajeSatisfechos + "%");
Console.WriteLine("Neutrales: " + porcentajeNeutrales + "%");
Console.WriteLine("Insatisfechos: " + porcentajeInsatisfechos + "%");

if (porcentajeSatisfechos >= 80)
{
    Console.WriteLine("Resultado: Excelente");
}
else if (porcentajeSatisfechos >= 50)
{
    Console.WriteLine("Resultado: Aceptable");
}
else
{
    Console.WriteLine("Resultado: Crítico");
}`
},
{
  n: 7, nivel: 1, titulo: 'El inventario de la bodega', empresa: 'Distribuidora',
  historia: 'Una distribuidora lleva el inventario de un producto. Parte de un stock inicial y registra los movimientos del día: las entradas llegan de los proveedores y las salidas se despachan a los clientes.',
  reglas: [
    "El stock inicial tiene que ser mayor que 0; si no, se vuelve a preguntar.",
    {
      "tabla": {
        "cab": [
          "Movimiento",
          "Significa"
        ],
        "filas": [
          [
            "Número positivo",
            "Entrada: llegan unidades del proveedor"
          ],
          [
            "Número negativo",
            "Salida: se despachan unidades a un cliente"
          ],
          [
            "0",
            "Se terminó el día"
          ]
        ]
      }
    },
    "No se puede despachar más de lo que hay. Una salida mayor que el stock disponible en ese momento se rechaza: el stock no cambia y se cuenta como salida rechazada.",
    {
      "ejemplo": "Stock 60. Llegan 25 y hay 85. Piden sacar 90: se rechaza y siguen 85. Piden sacar 40 y quedan 45."
    },
    "Al final, si el stock quedó por debajo del 20% del stock inicial, se muestra una alerta. Si no, la alerta no aparece.",
    {
      "pista": {
        "titulo": "Cómo se calcula un porcentaje",
        "formula": "El 20% de un valor es: valor × 20 ÷ 100",
        "ejemplo": "Con un stock inicial de 150, el 20% son 30: la alerta sale si al final quedan menos de 30."
      }
    }
  ],
  entradas: ['El stock inicial', 'Los movimientos del día, uno tras otro, hasta que escriban 0'],
  salidas: ['Stock final: <n>', 'Salidas rechazadas: <n>', 'Alerta: stock bajo   (solo si corresponde)'],
  etiquetas: ['Stock final:', 'Salidas rechazadas:', 'Alerta:'],
  ejemplo: [100, -30, 50, -200, -90, 0],
  pruebas: [[50, 0], [100, -90, 0], [100, -80, 0], [200, 10, -250, -300, 0]],
  sol: `int inicial;

do
{
    Console.WriteLine("Stock inicial:");
    inicial = int.Parse(Console.ReadLine());
}
while (inicial < 1);

int stock = inicial;
int rechazadas = 0;

Console.WriteLine("Movimiento (positivo entrada, negativo salida, 0 para terminar):");
int movimiento = int.Parse(Console.ReadLine());

while (movimiento != 0)
{
    if (movimiento > 0)
    {
        stock = stock + movimiento;
    }
    else
    {
        int salida = -movimiento;

        if (salida > stock)
        {
            rechazadas++;
        }
        else
        {
            stock = stock - salida;
        }
    }

    Console.WriteLine("Movimiento (positivo entrada, negativo salida, 0 para terminar):");
    movimiento = int.Parse(Console.ReadLine());
}

Console.WriteLine("Stock final: " + stock);
Console.WriteLine("Salidas rechazadas: " + rechazadas);

if (stock < inicial * 20 / 100)
{
    Console.WriteLine("Alerta: stock bajo");
}`
},
{
  n: 8, nivel: 1, titulo: 'La factura con IVA', empresa: 'Minimercado',
  historia: 'Un minimercado necesita un programa para facturar. El cajero registra los productos de la compra uno por uno, cada uno con su categoría y su precio, y al final se imprime la factura.',
  reglas: [
    "El cajero registra cada producto con su categoría y su precio. La compra termina cuando la categoría es 0.",
    {
      "tabla": {
        "cab": [
          "Categoría",
          "Tipo de producto",
          "IVA"
        ],
        "filas": [
          [
            "1",
            "Alimentos",
            "5%"
          ],
          [
            "2",
            "General",
            "19%"
          ],
          [
            "3",
            "Exento",
            "Sin IVA"
          ]
        ]
      }
    },
    "Si la categoría no es 0, 1, 2 ni 3, se muestra \"Categoría inválida\", no se pregunta el precio y ese producto no se registra.",
    "El IVA de cada producto es el porcentaje de su categoría aplicado al precio de ese producto.",
    "Si el subtotal (la suma de los precios, sin IVA) supera 200000, el cliente recibe un descuento del 10% del subtotal.",
    "Subtotal: la suma de los precios, sin IVA. IVA: la suma del IVA de todos los productos (el descuento no lo cambia). Total: lo que finalmente paga el cliente.",
    {
      "pista": {
        "titulo": "Cómo se calcula el IVA",
        "formula": "El IVA de un producto es: precio × porcentaje ÷ 100",
        "ejemplo": "Un producto de 30000 de la categoría 1 (5%) genera 1500 de IVA."
      }
    },
    {
      "pista": {
        "titulo": "Cómo se calcula el descuento",
        "formula": "El descuento es: subtotal × 10 ÷ 100",
        "ejemplo": "Con un subtotal de 300000, el descuento es 30000."
      }
    }
  ],
  entradas: ['Por cada producto: la categoría y luego el precio. La compra termina cuando la categoría es 0'],
  salidas: ['Productos: <cantidad>', 'Subtotal: <valor>', 'IVA: <valor>', 'Descuento: <valor>', 'Total: <valor>'],
  etiquetas: ['Productos:', 'Subtotal:', 'IVA:', 'Descuento:', 'Total:'],
  ejemplo: [1, 40000, 2, 100000, 3, 20000, 0],
  pruebas: [[2, 150000, 2, 100000, 0], [7, 1, 1000, 0], [0], [2, 200000, 0]],
  sol: `int productos = 0;
int subtotal = 0;
int iva = 0;

Console.WriteLine("Categoría (1 alimentos, 2 general, 3 exento, 0 para terminar):");
int categoria = int.Parse(Console.ReadLine());

while (categoria != 0)
{
    if (categoria < 0 || categoria > 3)
    {
        Console.WriteLine("Categoría inválida");
    }
    else
    {
        Console.WriteLine("Precio:");
        int precio = int.Parse(Console.ReadLine());

        productos++;
        subtotal = subtotal + precio;

        if (categoria == 1)
        {
            iva = iva + precio * 5 / 100;
        }
        else if (categoria == 2)
        {
            iva = iva + precio * 19 / 100;
        }
    }

    Console.WriteLine("Categoría (1 alimentos, 2 general, 3 exento, 0 para terminar):");
    categoria = int.Parse(Console.ReadLine());
}

int descuento = 0;

if (subtotal > 200000)
{
    descuento = subtotal * 10 / 100;
}

int total = subtotal + iva - descuento;

Console.WriteLine("Productos: " + productos);
Console.WriteLine("Subtotal: " + subtotal);
Console.WriteLine("IVA: " + iva);
Console.WriteLine("Descuento: " + descuento);
Console.WriteLine("Total: " + total);`
},
{
  n: 9, nivel: 1, titulo: 'El plan de producción', empresa: 'Fábrica de empaques',
  historia: 'Una fábrica planea su año. Sabe cuántas unidades producirá en enero y cuántas necesita producir al mes para cumplir su meta. Cada mes la producción crece, pero la planta tiene un tope.',
  reglas: [
    "El mes 1 se produce la cantidad indicada (entre 1 y 5000). A partir del mes 2, cada mes la producción crece un 5% respecto al mes anterior.",
    "La planta tiene un tope: nunca puede producir más de 5000 unidades en un mes.",
    "El programa reporta: lo producido en total durante los 12 meses; el primer mes en que se llega a la meta mensual o se supera (si nunca ocurre, se avisa); y cuántos meses se produjo exactamente 5000.",
    {
      "pista": {
        "titulo": "Cómo se calcula el crecimiento",
        "formula": "El 5% de un valor es: valor × 5 ÷ 100",
        "ejemplo": "Un mes de 2000 unidades crece 100, y el mes siguiente es de 2100."
      }
    }
  ],
  entradas: ['Las unidades del mes 1', 'La meta mensual'],
  salidas: ['Total del año: <n>', 'Primer mes que alcanza la meta: <mes>   (o  Meta no alcanzada)', 'Meses a capacidad máxima: <n>'],
  etiquetas: ['Total del año:', 'Primer mes que alcanza la meta:', 'Meta no alcanzada', 'Meses a capacidad máxima:'],
  ejemplo: [1000, 1500],
  pruebas: [[4000, 4500], [5000, 100], [1000, 3000], [20, 21]],
  sol: `Console.WriteLine("Unidades del mes 1:");
int produccion = int.Parse(Console.ReadLine());
Console.WriteLine("Meta mensual:");
int meta = int.Parse(Console.ReadLine());

int capacidad = 5000;
int total = 0;
int primerMes = 0;
int mesesAlTope = 0;

for (int mes = 1; mes <= 12; mes++)
{
    if (mes > 1)
    {
        produccion = produccion + produccion * 5 / 100;

        if (produccion > capacidad)
        {
            produccion = capacidad;
        }
    }

    total = total + produccion;

    if (produccion >= meta && primerMes == 0)
    {
        primerMes = mes;
    }

    if (produccion == capacidad)
    {
        mesesAlTope++;
    }
}

Console.WriteLine("Total del año: " + total);

if (primerMes == 0)
{
    Console.WriteLine("Meta no alcanzada");
}
else
{
    Console.WriteLine("Primer mes que alcanza la meta: " + primerMes);
}

Console.WriteLine("Meses a capacidad máxima: " + mesesAlTope);`
},
{
  n: 10, nivel: 1, titulo: 'El seguro del vehículo', empresa: 'Aseguradora',
  historia: 'Una aseguradora calcula la prima anual del seguro de un vehículo como un porcentaje del valor del vehículo. El porcentaje depende del perfil del conductor.',
  reglas: [
    {
      "tabla": {
        "cab": [
          "Situación del conductor",
          "Efecto en el porcentaje"
        ],
        "filas": [
          [
            "Punto de partida",
            "3%"
          ],
          [
            "Menos de 25 años, o menos de 2 años de licencia",
            "Sube 2 puntos (una sola vez, aunque cumpla las dos cosas)"
          ],
          [
            "Más de 60 años",
            "Baja 1 punto"
          ],
          [
            "Cada multa",
            "Sube 1 punto"
          ],
          [
            "Vehículo de más de 80000000",
            "Sube 1 punto"
          ],
          [
            "Más de 3 multas",
            "No se puede asegurar"
          ]
        ]
      }
    },
    "La prima anual es ese porcentaje del valor del vehículo.",
    "El valor del vehículo no pasa de 200000000.",
    {
      "pista": {
        "titulo": "Cómo se calcula la prima",
        "formula": "La prima es: valor del vehículo × porcentaje ÷ 100",
        "ejemplo": "Un vehículo de 10000000 con un porcentaje de 5% paga una prima de 500000."
      }
    }
  ],
  entradas: ['La edad del conductor', 'Los años de licencia', 'El valor del vehículo', 'La cantidad de multas'],
  salidas: ['Porcentaje: <n>%', 'Prima anual: <valor>', 'o, si no se puede asegurar:  No asegurable'],
  etiquetas: ['Porcentaje:', 'Prima anual:', 'No asegurable'],
  ejemplo: [22, 1, 30000000, 2],
  pruebas: [[40, 10, 50000000, 0], [61, 30, 100000000, 1], [45, 5, 60000000, 4], [25, 2, 80000000, 0]],
  sol: `Console.WriteLine("Edad del conductor:");
int edad = int.Parse(Console.ReadLine());
Console.WriteLine("Años de licencia:");
int licencia = int.Parse(Console.ReadLine());
Console.WriteLine("Valor del vehículo:");
int valor = int.Parse(Console.ReadLine());
Console.WriteLine("Cantidad de multas:");
int multas = int.Parse(Console.ReadLine());

if (multas > 3)
{
    Console.WriteLine("No asegurable");
}
else
{
    int porcentaje = 3;

    if (edad < 25 || licencia < 2)
    {
        porcentaje = porcentaje + 2;
    }

    if (edad > 60)
    {
        porcentaje = porcentaje - 1;
    }

    porcentaje = porcentaje + multas;

    if (valor > 80000000)
    {
        porcentaje = porcentaje + 1;
    }

    int prima = valor * porcentaje / 100;

    Console.WriteLine("Porcentaje: " + porcentaje + "%");
    Console.WriteLine("Prima anual: " + prima);
}`
},
{
  n: 11, nivel: 2, titulo: 'La fecha válida', empresa: 'Registraduría',
  historia: 'Un sistema de registro civil recibe fechas escritas por los funcionarios y necesita avisar si la fecha existe en el calendario o si es un error de digitación.',
  reglas: [
    {
      "tabla": {
        "cab": [
          "Mes",
          "Días"
        ],
        "filas": [
          [
            "Enero, marzo, mayo, julio, agosto, octubre y diciembre",
            "31"
          ],
          [
            "Abril, junio, septiembre y noviembre",
            "30"
          ],
          [
            "Febrero",
            "28, o 29 si el año es bisiesto"
          ]
        ]
      }
    },
    "El mes debe estar entre 1 y 12, y el día debe ser al menos 1.",
    "Un año es bisiesto si es divisible por 4. Pero los años de siglo (los divisibles por 100) solo son bisiestos si también son divisibles por 400.",
    {
      "ejemplo": "2020 y 2400 son bisiestos. 2021 y 2100 no lo son."
    }
  ],
  entradas: ['El día', 'El mes', 'El año'],
  salidas: ['Fecha válida  o  Fecha inválida'],
  etiquetas: ['Fecha válida', 'Fecha inválida'],
  ejemplo: [29, 2, 2024],
  pruebas: [[29, 2, 2023], [29, 2, 1900], [29, 2, 2000], [31, 9, 2025]],
  sol: `Console.WriteLine("Día:");
int dia = int.Parse(Console.ReadLine());
Console.WriteLine("Mes:");
int mes = int.Parse(Console.ReadLine());
Console.WriteLine("Año:");
int anio = int.Parse(Console.ReadLine());

bool valida = true;

if (mes < 1 || mes > 12 || dia < 1)
{
    valida = false;
}
else
{
    int maximo = 31;

    if (mes == 4 || mes == 6 || mes == 9 || mes == 11)
    {
        maximo = 30;
    }
    else if (mes == 2)
    {
        if ((anio % 4 == 0 && anio % 100 != 0) || anio % 400 == 0)
        {
            maximo = 29;
        }
        else
        {
            maximo = 28;
        }
    }

    if (dia > maximo)
    {
        valida = false;
    }
}

if (valida)
{
    Console.WriteLine("Fecha válida");
}
else
{
    Console.WriteLine("Fecha inválida");
}`
},
{
  n: 12, nivel: 2, titulo: 'La máquina expendedora', empresa: 'Fabricante de máquinas',
  historia: 'Una empresa fabrica máquinas expendedoras de snacks. Cada producto tiene un precio y el cliente lo paga insertando monedas una por una hasta cubrirlo. Si pagó de más, la máquina devuelve el cambio con la menor cantidad posible de monedas.',
  reglas: [
    "La máquina solo acepta monedas de 100, 200, 500 y 1000. Cualquier otro valor se rechaza con el mensaje \"Moneda rechazada\" y no suma al pago.",
    "El cliente va insertando monedas, una por una, hasta cubrir el precio del producto. El precio siempre es múltiplo de 100.",
    "Si pagó de más, la máquina devuelve el cambio con la menor cantidad posible de monedas.",
    {
      "ejemplo": "Un cambio de 700 se devuelve con 2 monedas: una de 500 y una de 200."
    }
  ],
  entradas: ['El precio del producto', 'Las monedas que va insertando el cliente, una tras otra'],
  salidas: ['Pagado: <valor>', 'Cambio: <valor>', 'Monedas de 1000: <n>', 'Monedas de 500: <n>', 'Monedas de 200: <n>', 'Monedas de 100: <n>'],
  etiquetas: ['Pagado:', 'Cambio:', 'Monedas de 1000:', 'Monedas de 500:', 'Monedas de 200:', 'Monedas de 100:'],
  ejemplo: [1300, 1000, 500],
  pruebas: [[2500, 1000, 1000, 1000], [800, 500, 300, 200, 200], [1000, 1000], [100, 1000]],
  sol: `Console.WriteLine("Precio del producto:");
int precio = int.Parse(Console.ReadLine());

int pagado = 0;

while (pagado < precio)
{
    Console.WriteLine("Inserte una moneda (100, 200, 500 o 1000):");
    int moneda = int.Parse(Console.ReadLine());

    if (moneda == 100 || moneda == 200 || moneda == 500 || moneda == 1000)
    {
        pagado = pagado + moneda;
    }
    else
    {
        Console.WriteLine("Moneda rechazada");
    }
}

int cambio = pagado - precio;
int resto = cambio;

int de1000 = resto / 1000;
resto = resto % 1000;
int de500 = resto / 500;
resto = resto % 500;
int de200 = resto / 200;
resto = resto % 200;
int de100 = resto / 100;

Console.WriteLine("Pagado: " + pagado);
Console.WriteLine("Cambio: " + cambio);
Console.WriteLine("Monedas de 1000: " + de1000);
Console.WriteLine("Monedas de 500: " + de500);
Console.WriteLine("Monedas de 200: " + de200);
Console.WriteLine("Monedas de 100: " + de100);`
},
{
  n: 13, nivel: 2, titulo: 'Las multas de la biblioteca', empresa: 'Biblioteca universitaria',
  historia: 'La biblioteca de una universidad quiere calcular las multas del día. A medida que se devuelven los libros, el bibliotecario escribe cuántos días de retraso trajo cada uno.',
  reglas: [
    {
      "tabla": {
        "cab": [
          "Días de retraso del libro",
          "Multa por cada día"
        ],
        "filas": [
          [
            "Los primeros 7 días",
            "500"
          ],
          [
            "Del día 8 en adelante",
            "1000"
          ]
        ]
      }
    },
    {
      "ejemplo": "Un libro con 9 días de retraso paga 7 días a 500 y 2 días a 1000."
    },
    "Un libro con 0 días de retraso no paga multa y no cuenta como libro con retraso.",
    "La jornada termina cuando el bibliotecario escribe -1 en lugar de los días de retraso."
  ],
  entradas: ['Los días de retraso de cada libro, uno tras otro, hasta que escriban -1'],
  salidas: ['Libros con retraso: <n>', 'Total recaudado: <valor>', 'Mayor multa: <valor>'],
  etiquetas: ['Libros con retraso:', 'Total recaudado:', 'Mayor multa:'],
  ejemplo: [3, 0, 10, -1],
  pruebas: [[-1], [7, 8, -1], [1, 1, 1, -1], [20, 15, 30, -1]],
  sol: `int retrasados = 0;
int total = 0;
int mayorMulta = 0;

Console.WriteLine("Días de retraso (-1 para terminar):");
int dias = int.Parse(Console.ReadLine());

while (dias != -1)
{
    if (dias > 0)
    {
        int multa;

        if (dias <= 7)
        {
            multa = dias * 500;
        }
        else
        {
            multa = 7 * 500 + (dias - 7) * 1000;
        }

        retrasados++;
        total = total + multa;

        if (multa > mayorMulta)
        {
            mayorMulta = multa;
        }
    }

    Console.WriteLine("Días de retraso (-1 para terminar):");
    dias = int.Parse(Console.ReadLine());
}

Console.WriteLine("Libros con retraso: " + retrasados);
Console.WriteLine("Total recaudado: " + total);
Console.WriteLine("Mayor multa: " + mayorMulta);`
},
{
  n: 14, nivel: 2, titulo: 'La deuda con interés', empresa: 'Banco',
  historia: 'Un banco presta dinero con un interés del 2% mensual sobre el saldo que se debe. Un cliente quiere saber en cuántos meses terminará de pagar su deuda si cada mes paga una cuota fija.',
  reglas: [
    "El préstamo cobra un interés del 2% mensual. Cada mes el banco cobra ese interés sobre lo que el cliente debe en ese momento, y el cliente paga su cuota fija. La deuda queda pagada cuando lo que se debe llega a 0 o menos (el último mes puede pagarse menos que la cuota).",
    "Si con esa cuota la deuda nunca se terminaría de pagar, el programa solo avisa con el mensaje indicado abajo.",
    "Cuando sí se paga, se muestra en cuántos meses y cuánto se pagó en total solo de intereses (los intereses de todos los meses sumados).",
    {
      "pista": {
        "titulo": "Cómo se calcula el interés",
        "formula": "El 2% de un valor es: valor × 2 ÷ 100",
        "ejemplo": "Si se deben 500000, el interés de ese mes es 10000."
      }
    }
  ],
  entradas: ['La deuda inicial', 'La cuota mensual'],
  salidas: ['Meses: <n>', 'Intereses pagados: <valor>', 'o, si nunca se paga:  La deuda nunca se termina de pagar'],
  etiquetas: ['Meses:', 'Intereses pagados:', 'La deuda nunca se termina de pagar'],
  ejemplo: [1000000, 300000],
  pruebas: [[100000, 50000], [1000000, 20000], [2000000, 100000], [50, 1]],
  sol: `Console.WriteLine("Deuda inicial:");
int deuda = int.Parse(Console.ReadLine());
Console.WriteLine("Cuota mensual:");
int cuota = int.Parse(Console.ReadLine());

int interesDelPrimerMes = deuda * 2 / 100;

if (cuota <= interesDelPrimerMes)
{
    Console.WriteLine("La deuda nunca se termina de pagar");
}
else
{
    int saldo = deuda;
    int meses = 0;
    int intereses = 0;

    while (saldo > 0)
    {
        int interes = saldo * 2 / 100;

        intereses = intereses + interes;
        saldo = saldo + interes - cuota;
        meses++;
    }

    Console.WriteLine("Meses: " + meses);
    Console.WriteLine("Intereses pagados: " + intereses);
}`
},
{
  n: 15, nivel: 2, titulo: 'Piedra, papel o tijera', empresa: 'Torneo de videojuegos',
  historia: 'Un torneo escolar juega piedra, papel o tijera al mejor de tres: gana el primer jugador que llegue a 2 rondas ganadas. El árbitro necesita un programa que lleve la cuenta.',
  reglas: [
    {
      "tabla": {
        "cab": [
          "Código",
          "Jugada",
          "Le gana a"
        ],
        "filas": [
          [
            "1",
            "Piedra",
            "Tijera"
          ],
          [
            "2",
            "Papel",
            "Piedra"
          ],
          [
            "3",
            "Tijera",
            "Papel"
          ]
        ]
      }
    },
    "En cada ronda se escribe primero la jugada del jugador 1 y luego la del jugador 2.",
    "Si alguna de las dos jugadas no es 1, 2 ni 3, se muestra \"Jugada inválida, se repite la ronda\" y esa ronda no cuenta.",
    "Un empate no le da punto a nadie, pero sí cuenta como ronda jugada.",
    "Gana el partido el primero que llegue a 2 rondas ganadas; apenas pasa, el programa termina y no pide más jugadas."
  ],
  entradas: ['En cada ronda: la jugada del jugador 1 y luego la del jugador 2'],
  salidas: ['Rondas jugadas: <n>   (las válidas, incluidos los empates)', 'Ganador: Jugador 1  o  Ganador: Jugador 2'],
  etiquetas: ['Rondas jugadas:', 'Ganador:'],
  ejemplo: [1, 3, 2, 2, 2, 1],
  pruebas: [[1, 2, 3, 2, 1, 2], [4, 1, 1, 1, 2, 1, 3, 3, 1, 3], [1, 3, 1, 3], [2, 1, 1, 2, 3, 3, 2, 3]],
  sol: `int victorias1 = 0;
int victorias2 = 0;
int rondas = 0;

while (victorias1 < 2 && victorias2 < 2)
{
    Console.WriteLine("Jugada del jugador 1 (1 piedra, 2 papel, 3 tijera):");
    int jugada1 = int.Parse(Console.ReadLine());
    Console.WriteLine("Jugada del jugador 2 (1 piedra, 2 papel, 3 tijera):");
    int jugada2 = int.Parse(Console.ReadLine());

    if (jugada1 < 1 || jugada1 > 3 || jugada2 < 1 || jugada2 > 3)
    {
        Console.WriteLine("Jugada inválida, se repite la ronda");
    }
    else
    {
        rondas++;

        if (jugada1 == jugada2)
        {
            Console.WriteLine("Empate");
        }
        else if ((jugada1 == 1 && jugada2 == 3) || (jugada1 == 2 && jugada2 == 1) || (jugada1 == 3 && jugada2 == 2))
        {
            victorias1++;
            Console.WriteLine("Gana el jugador 1");
        }
        else
        {
            victorias2++;
            Console.WriteLine("Gana el jugador 2");
        }
    }
}

Console.WriteLine("Rondas jugadas: " + rondas);

if (victorias1 == 2)
{
    Console.WriteLine("Ganador: Jugador 1");
}
else
{
    Console.WriteLine("Ganador: Jugador 2");
}`
},
{
  n: 16, nivel: 2, titulo: 'Las elecciones del colegio', empresa: 'Consejo estudiantil',
  historia: 'El consejo estudiantil de un colegio hace su elección con 3 candidatos. Cada votante escribe su voto en el computador y al cierre se necesita el conteo y el resultado.',
  reglas: [
    {
      "tabla": {
        "cab": [
          "Voto",
          "Significa"
        ],
        "filas": [
          [
            "1, 2 o 3",
            "Voto para ese candidato"
          ],
          [
            "4",
            "Voto en blanco"
          ],
          [
            "0",
            "Cierra la votación"
          ],
          [
            "Cualquier otro número",
            "Voto no válido: se muestra \"Voto no válido\" y no se cuenta"
          ]
        ]
      }
    },
    "El porcentaje del ganador se calcula sobre todos los votos contados, incluido el voto en blanco.",
    "Si hay empate en el primer lugar (incluso si ningún candidato recibió votos), el resultado es Empate.",
    {
      "pista": {
        "titulo": "Cómo se calcula el porcentaje del ganador",
        "formula": "El porcentaje es: votos del ganador × 100 ÷ total de votos contados",
        "ejemplo": "Un ganador con 5 votos de 12 contados tiene 5 × 100 ÷ 12 = 41%."
      }
    }
  ],
  entradas: ['Los votos, uno tras otro, hasta que escriban 0'],
  salidas: ['Candidato 1: <votos>', 'Candidato 2: <votos>', 'Candidato 3: <votos>', 'Blanco: <votos>', 'Resultado: Candidato <n> con <porcentaje>%   (o  Resultado: Empate)'],
  etiquetas: ['Candidato 1:', 'Candidato 2:', 'Candidato 3:', 'Blanco:', 'Resultado:'],
  ejemplo: [1, 2, 1, 3, 4, 1, 2, 0],
  pruebas: [[2, 2, 3, 3, 0], [5, 3, 3, 1, 4, 0], [1, 1, 1, 0], [4, 4, 1, 0]],
  sol: `int votos1 = 0;
int votos2 = 0;
int votos3 = 0;
int blancos = 0;

Console.WriteLine("Voto (1, 2, 3, 4 = blanco, 0 = cerrar):");
int voto = int.Parse(Console.ReadLine());

while (voto != 0)
{
    if (voto == 1)
    {
        votos1++;
    }
    else if (voto == 2)
    {
        votos2++;
    }
    else if (voto == 3)
    {
        votos3++;
    }
    else if (voto == 4)
    {
        blancos++;
    }
    else
    {
        Console.WriteLine("Voto no válido");
    }

    Console.WriteLine("Voto (1, 2, 3, 4 = blanco, 0 = cerrar):");
    voto = int.Parse(Console.ReadLine());
}

int total = votos1 + votos2 + votos3 + blancos;

Console.WriteLine("Candidato 1: " + votos1);
Console.WriteLine("Candidato 2: " + votos2);
Console.WriteLine("Candidato 3: " + votos3);
Console.WriteLine("Blanco: " + blancos);

int mayor = votos1;

if (votos2 > mayor)
{
    mayor = votos2;
}

if (votos3 > mayor)
{
    mayor = votos3;
}

int empatados = 0;

if (votos1 == mayor)
{
    empatados++;
}

if (votos2 == mayor)
{
    empatados++;
}

if (votos3 == mayor)
{
    empatados++;
}

if (empatados > 1)
{
    Console.WriteLine("Resultado: Empate");
}
else
{
    int ganador = 3;

    if (votos1 == mayor)
    {
        ganador = 1;
    }
    else if (votos2 == mayor)
    {
        ganador = 2;
    }

    Console.WriteLine("Resultado: Candidato " + ganador + " con " + (mayor * 100 / total) + "%");
}`
},
{
  n: 17, nivel: 2, titulo: 'La taquilla del cine', empresa: 'Cadena de cines',
  historia: 'Un cine tiene 3 películas en cartelera y todas cuestan lo mismo: 12000 por entrada. En la taquilla se atiende a un cliente tras otro y al cerrar la caja se necesita el resumen.',
  reglas: [
    "Todas las películas cuestan lo mismo: 12000 por entrada.",
    {
      "tabla": {
        "cab": [
          "Entradas en la compra",
          "Descuento"
        ],
        "filas": [
          [
            "De 1 a 3",
            "Ninguno"
          ],
          [
            "4 o más",
            "10% del valor de esa compra"
          ]
        ]
      }
    },
    "Por cada cliente se pregunta la película (1, 2 o 3) y luego cuántas entradas lleva (siempre al menos 1). Escribir 0 en la película cierra la taquilla.",
    "Si la película no es 0, 1, 2 ni 3, se muestra \"Película no válida\", no se pregunta cuántas entradas y se sigue con el siguiente cliente.",
    "La película más vendida es la que más entradas vendió (no la que más dinero dio). Si hay empate, gana la de número menor. Si no se vendió nada, se muestra \"Más vendida: ninguna\".",
    {
      "pista": {
        "titulo": "Cómo se calcula el descuento",
        "formula": "El 10% de un valor es: valor × 10 ÷ 100",
        "ejemplo": "Una compra de 100000 con descuento del 10% se rebaja 10000."
      }
    }
  ],
  entradas: ['Por cada cliente: la película y luego la cantidad de entradas. La taquilla cierra cuando la película es 0'],
  salidas: ['Recaudado: <valor>', 'Más vendida: Película <n> (entradas: <cantidad>)   (o  Más vendida: ninguna)'],
  etiquetas: ['Recaudado:', 'Más vendida:'],
  ejemplo: [1, 2, 2, 4, 1, 1, 3, 5, 0],
  pruebas: [[0], [7, 2, 3, 0], [1, 4, 2, 4, 0], [3, 1, 1, 1, 0]],
  sol: `int entradas1 = 0;
int entradas2 = 0;
int entradas3 = 0;
int recaudado = 0;

Console.WriteLine("Película (1, 2, 3 o 0 para cerrar):");
int pelicula = int.Parse(Console.ReadLine());

while (pelicula != 0)
{
    if (pelicula < 0 || pelicula > 3)
    {
        Console.WriteLine("Película no válida");
    }
    else
    {
        Console.WriteLine("Cantidad de entradas:");
        int entradas = int.Parse(Console.ReadLine());

        int valor = entradas * 12000;

        if (entradas >= 4)
        {
            valor = valor - valor * 10 / 100;
        }

        recaudado = recaudado + valor;

        if (pelicula == 1)
        {
            entradas1 = entradas1 + entradas;
        }
        else if (pelicula == 2)
        {
            entradas2 = entradas2 + entradas;
        }
        else
        {
            entradas3 = entradas3 + entradas;
        }
    }

    Console.WriteLine("Película (1, 2, 3 o 0 para cerrar):");
    pelicula = int.Parse(Console.ReadLine());
}

Console.WriteLine("Recaudado: " + recaudado);

int masVendida = 1;
int mayor = entradas1;

if (entradas2 > mayor)
{
    masVendida = 2;
    mayor = entradas2;
}

if (entradas3 > mayor)
{
    masVendida = 3;
    mayor = entradas3;
}

if (mayor == 0)
{
    Console.WriteLine("Más vendida: ninguna");
}
else
{
    Console.WriteLine("Más vendida: Película " + masVendida + " (entradas: " + mayor + ")");
}`
},
{
  n: 18, nivel: 2, titulo: 'El histograma de ventas', empresa: 'Tienda de barrio',
  historia: 'El dueño de una tienda anota cuántas unidades de su producto estrella vendió cada día de la semana (de 1 a 9) y quiere verlo dibujado con asteriscos para comparar los días de un vistazo.',
  reglas: [
    "Se piden las ventas de 7 días, una por una. Cada venta debe estar entre 1 y 9; si no, se vuelve a pedir el dato de ese mismo día.",
    {
      "ejemplo": "La barra de un día con 5 unidades vendidas se ve así: *****"
    },
    "Para cada día se muestra una línea con el número del día y su barra: tantos asteriscos como unidades se vendieron.",
    "Al final se dice cuál fue el mejor día (el de más ventas). Si hay empate, es el primero que alcanzó ese máximo."
  ],
  entradas: ['Las ventas de cada uno de los 7 días, uno tras otro'],
  salidas: ['Día 1: <asteriscos>', '(una línea así por cada uno de los 7 días)', 'Mejor día: <día> (ventas: <unidades>)'],
  etiquetas: ['Día 1:', 'Día 2:', 'Día 3:', 'Día 4:', 'Día 5:', 'Día 6:', 'Día 7:', 'Mejor día:'],
  ejemplo: [3, 5, 2, 9, 1, 4, 6],
  pruebas: [[1, 1, 1, 1, 1, 1, 1], [9, 9, 9, 9, 9, 9, 9], [12, 2, 8, 0, 4, 4, 7, 1, 3], [5, 4, 3, 2, 1, 2, 3]],
  sol: `int mejorDia = 1;
int mejorVenta = 0;

for (int dia = 1; dia <= 7; dia++)
{
    int ventas;

    do
    {
        Console.WriteLine("Ventas del día " + dia + " (1 a 9):");
        ventas = int.Parse(Console.ReadLine());
    }
    while (ventas < 1 || ventas > 9);

    string barra = "";

    for (int i = 1; i <= ventas; i++)
    {
        barra = barra + "*";
    }

    Console.WriteLine("Día " + dia + ": " + barra);

    if (ventas > mejorVenta)
    {
        mejorVenta = ventas;
        mejorDia = dia;
    }
}

Console.WriteLine("Mejor día: " + mejorDia + " (ventas: " + mejorVenta + ")");`
},
{
  n: 19, nivel: 2, titulo: 'El calendario del mes', empresa: 'Editorial de agendas',
  historia: 'Una editorial de agendas quiere generar automáticamente la página de calendario de cada mes. Solo conoce cuántos días tiene el mes y en qué día de la semana cae el día 1.',
  reglas: [
    {
      "tabla": {
        "cab": [
          "Dato",
          "Valores"
        ],
        "filas": [
          [
            "Días del mes",
            "De 28 a 31"
          ],
          [
            "Día en que empieza el mes",
            "1 = lunes, 2 = martes, ... 7 = domingo"
          ]
        ]
      }
    },
    "Si alguno de los dos datos no es válido, se vuelve a preguntar.",
    "Primero se escribe el encabezado exactamente así: Lu Ma Mi Ju Vi Sa Do",
    "Cada día ocupa 2 espacios (el número alineado a la derecha) y entre un día y el siguiente va un espacio. Cada línea tiene los 7 días, de lunes a domingo, y los lugares antes del día 1 quedan en blanco.",
    {
      "ejemplo": "Si el mes empieza en miércoles (3), el día 1 queda debajo de Mi. Fíjate en el ejemplo."
    }
  ],
  entradas: ['Cuántos días tiene el mes', 'El día de la semana en que empieza (1 = lunes ... 7 = domingo)'],
  salidas: ['El encabezado y luego las filas del calendario (ver ejemplo)'],
  desde: 'Lu Ma Mi Ju Vi Sa Do', exacto: true,
  ejemplo: [30, 3],
  pruebas: [[31, 1], [28, 1], [40, 29, 9, 7], [31, 6]],
  sol: `int dias;

do
{
    Console.WriteLine("Días del mes (28 a 31):");
    dias = int.Parse(Console.ReadLine());
}
while (dias < 28 || dias > 31);

int inicio;

do
{
    Console.WriteLine("Día en que empieza (1 lunes ... 7 domingo):");
    inicio = int.Parse(Console.ReadLine());
}
while (inicio < 1 || inicio > 7);

Console.WriteLine("Lu Ma Mi Ju Vi Sa Do");

string linea = "";
int columna = inicio - 1;

for (int i = 1; i <= columna; i++)
{
    linea = linea + "   ";
}

for (int dia = 1; dia <= dias; dia++)
{
    if (dia < 10)
    {
        linea = linea + " " + dia;
    }
    else
    {
        linea = linea + dia;
    }

    columna++;

    if (columna == 7)
    {
        Console.WriteLine(linea);
        linea = "";
        columna = 0;
    }
    else
    {
        linea = linea + " ";
    }
}

if (columna > 0)
{
    Console.WriteLine(linea);
}`
},
{
  n: 20, nivel: 2, titulo: 'El cierre de las sucursales', empresa: 'Cadena de tiendas',
  historia: 'Una cadena de tiendas cierra el mes: cada sucursal reporta sus ventas de cada día y la empresa calcula la comisión de cada una y cuál vendió más.',
  reglas: [
    {
      "tabla": {
        "cab": [
          "Ventas de la sucursal en el mes",
          "Comisión"
        ],
        "filas": [
          [
            "Hasta 5000000",
            "3%"
          ],
          [
            "Lo que pase de 5000000",
            "5% (solo sobre ese excedente)"
          ]
        ]
      }
    },
    {
      "ejemplo": "Con 8000000 de ventas: 3% sobre los primeros 5000000 y 5% sobre los 3000000 restantes."
    },
    "Se pregunta cuántas sucursales hay y cuántos días se reportan (los dos al menos 1; si no, se vuelve a preguntar). Luego se piden las ventas de cada día, sucursal por sucursal.",
    "El total de una sucursal son sus ventas de todos los días reportados. La mejor sucursal es la de mayor total; si hay empate, la de número menor.",
    {
      "pista": {
        "titulo": "Cómo se calcula un porcentaje",
        "formula": "El X% de un valor es: valor × X ÷ 100",
        "ejemplo": "El 3% de 4000000 es 120000."
      }
    }
  ],
  entradas: ['Cuántas sucursales hay', 'Cuántos días se reportan', 'Las ventas de cada día de la sucursal 1, luego las de la sucursal 2, y así'],
  salidas: ['Sucursal <n>: total <valor>, comisión <valor>   (una línea por sucursal)', 'Mejor sucursal: <n> con <total>'],
  etiquetas: ['Sucursal 1:', 'Sucursal 2:', 'Sucursal 3:', 'Mejor sucursal:'],
  ejemplo: [2, 3, 2000000, 1500000, 2500000, 1000000, 800000, 700000],
  pruebas: [[1, 1, 5000000], [3, 2, 100, 200, 5000000, 1, 0, 300], [2, 2, 1000, 1000, 1000, 1000], [1, 4, 3000000, 3000000, 0, 1]],
  sol: `int sucursales;

do
{
    Console.WriteLine("Cantidad de sucursales:");
    sucursales = int.Parse(Console.ReadLine());
}
while (sucursales < 1);

int dias;

do
{
    Console.WriteLine("Cantidad de días:");
    dias = int.Parse(Console.ReadLine());
}
while (dias < 1);

int mejorSucursal = 0;
int mayorTotal = -1;

for (int s = 1; s <= sucursales; s++)
{
    int total = 0;

    for (int d = 1; d <= dias; d++)
    {
        Console.WriteLine("Ventas de la sucursal " + s + ", día " + d + ":");
        total = total + int.Parse(Console.ReadLine());
    }

    int comision;

    if (total <= 5000000)
    {
        comision = total * 3 / 100;
    }
    else
    {
        comision = 5000000 * 3 / 100 + (total - 5000000) * 5 / 100;
    }

    Console.WriteLine("Sucursal " + s + ": total " + total + ", comisión " + comision);

    if (total > mayorTotal)
    {
        mayorTotal = total;
        mejorSucursal = s;
    }
}

Console.WriteLine("Mejor sucursal: " + mejorSucursal + " con " + mayorTotal);`
}
];
