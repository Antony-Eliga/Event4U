using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BO
{
    public class Event
    {
        public int Id { get; set; }
        public string name { get; set; }
        public DateTime date { get; set; }

        public float lat { get; set; }
        public float lng { get; set; }
        public string address { get; set; }
    }
}
