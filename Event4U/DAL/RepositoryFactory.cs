//using BO;
using BO;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL
{
    public class RepositoryFactory<C> where C : DbContext, IDbContext
    {
        public static IRepository<T> GetRepository<T>(DbContext context) where T : class
        {
            return new GenericRepository<T>(context);
        }

        public static IRepository<Event> GetEventRepository(C context)
        {
            return new EventRepository<C>(context);
        }
    }
}
