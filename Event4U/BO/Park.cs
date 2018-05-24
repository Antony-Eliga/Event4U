using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BO
{
    public class Park { 
        public string Id { get; set; }
        public string Name { get; set; }
        public string Status { get; set; }
        public int Max { get; set; }
        public int Free { get; set; }
        public float[] Coordinates { get; set; }
        public float Tarif_15 { get; set; }
        public float Tarif_30 { get; set; }
        public float Tarif_1h { get; set; }
        public float Tarif_1h30 { get; set; }
        public float Tarif_2h { get; set; }
        public float Tarif_3h { get; set; }
        public float Tarif_4h { get; set; }
        public string Horaire { get; set; }
        public string Duration { get; set; }
        public string Distance { get; set; }
        public float Cout { get; set; }
    }
}
