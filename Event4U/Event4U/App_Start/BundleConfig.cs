using System.Web;
using System.Web.Optimization;

namespace Event4U
{
    public class BundleConfig
    {
        // Pour plus d'informations sur le regroupement, visitez http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            //bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
            //            "~/Scripts/jquery-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Content/js/jquery-3.3.1.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Scripts/jquery.validate*"));

            // Utilisez la version de développement de Modernizr pour le développement et l'apprentissage. Puis, une fois
            // prêt pour la production, utilisez l'outil de génération (bluid) sur http://modernizr.com pour choisir uniquement les tests dont vous avez besoin.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));

            //            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
            //                     "~/Scripts/bootstrap.js",
            //                      "~/Scripts/respond.js"));

            bundles.Add(new ScriptBundle("~/bundles/materialize").Include(
            "~/Content/materialize/js/materialize.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/main").Include(
                        "~/Content/js/underscore-min.js",
                        "~/Content/js/glide.min.js",
                        "~/Content/js/maps.js"
                        ));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                      "~/Content/materialize/css/materialize.min.css",
                      "~/Content/glide.core.min.css",
                      "~/Content/glide.theme.min.css",
                      "~/Content/site.css"
                      ));
        }
    }
}
