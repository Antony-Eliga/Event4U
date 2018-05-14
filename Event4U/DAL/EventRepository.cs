using BO;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL
{
    class EventRepository<T> : GenericRepository<Event> where T : DbContext, IDbContext
    {
        public EventRepository(T context) : base(context)
        {
        }

        public override void Update(Event ev)
        {
            Event e = GetById(ev.Id);
            e.Id = ev.Id;
            e.name = ev.name;
            e.date = ev.date;
            // TODO : race competitors
            dbContext.SaveChanges();
        }
    }
}
