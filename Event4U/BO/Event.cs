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
        [Display(Name = "Nom de l'événement")]
        public string name { get; set; }
        [Display(Name = "Date de l'événement")]
        public DateTime date { get; set; }
        [Display(Name = "Date fin l'événement")]
        public DateTime dateFin { get; set; }
        [Display(Name = "Descriptif fin l'événement")]
        public string descriptif { get; set; }
        public virtual ICollection<Image> Images { get; set; }

        public float lat { get; set; }
        public float lng { get; set; }
        public string address { get; set; }

        public Event()
        {
            Images = new List<Image>();
        }
    }
}
