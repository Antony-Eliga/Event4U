using BO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL
{
    public interface IRepository<T> where T : class
    {
        List<T> GetAll();
        void Insert(T element);
        T GetById(int id);
        void Update(T element);
        void Delete(int id);
    }
}
