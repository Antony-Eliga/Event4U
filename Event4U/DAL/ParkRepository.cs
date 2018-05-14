using BO;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL
{
    class ParkRepository<T> : GenericRepository<Park> where T : DbContext, IDbContext
    {
        public ParkRepository(T context) : base(context)
        {
        }

        public override void Update(Park park)
        {
            Park p = GetById(park.Id);
            p.Id = park.Id;
            p.ParkInformation = park.ParkInformation;
            // TODO : race competitors
            dbContext.SaveChanges();
        }
    }
}
