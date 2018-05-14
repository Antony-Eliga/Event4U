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
        }
    }
}
