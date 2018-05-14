using BO;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL
{
    public class GenericRepository<T> : IRepository<T> where T : class
    {
        protected DbContext dbContext;
        private DbSet<T> set;

        public GenericRepository(DbContext context)
        {
            dbContext = context;
            set = dbContext.Set<T>();
        }

        public void Delete(int id)
        {
            set.Remove(GetById(id));
            dbContext.SaveChanges();
        }

        public List<T> GetAll()
        {
            return set.ToList();
        }

        public List<T> GetAll(Func<T, bool> predicate)
        {
            return set.Where(predicate).ToList();
        }

        public T GetById(int id)
        {
            return set.Find(id);
        }

        public void Insert(T element)
        {
            set.Add(element);
            dbContext.SaveChanges();
        }

        public virtual void Update(T element)
        {
            dbContext.Entry(element).State = EntityState.Modified;
            dbContext.SaveChanges();
        }

        public void InsertTransact(T element)
        {
            using (var transaction = dbContext.Database.BeginTransaction())
            {
                set.Add(element);
                dbContext.SaveChanges();

                //autres ajouts en bases
                transaction.Commit();
            }
        }
    }
}
