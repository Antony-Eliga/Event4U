using Event4U.Models;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(Event4U.Startup))]
namespace Event4U
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
            using (var context = new ApplicationDbContext())
            {
                using (var transaction = context.Database.BeginTransaction())
                {
                    var roleManager = new RoleManager<IdentityRole>
                    (new RoleStore<IdentityRole>(context));

                    var userManager = new UserManager<ApplicationUser>
                        (new UserStore<ApplicationUser>(context));

                    if (!roleManager.RoleExists(Roles.Administrator))
                    {
                        roleManager.Create(new IdentityRole(Roles.Administrator));
                        var admin = new ApplicationUser
                        {
                            UserName = "admin@gmail.com",
                            Email = "admin@gmail.com"
                        };

                        var result = userManager.Create(admin, "Pa$$w0rd");
                        if (result.Succeeded)
                        {
                            userManager.AddToRole(admin.Id, Roles.Administrator);

                            transaction.Commit();
                        }
                    }
                }
            }
        }
    }
}
