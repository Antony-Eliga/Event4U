using BO;
using System.Data.Entity;

namespace DAL
{
    public interface IDbContext
    {
        DbSet<Event> Event { get; set; }
        DbSet<Park> Park { get; set; }
    }
}