using BO;
using Event4U.Services;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;

namespace Event4U.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            string id = "colombier";
            Parks.Feature feature = ParkService.getOneFeature(id);
            Parks.Park park = ParkService.getOnePark(id);
            Console.WriteLine(park.parkInformation.name);
            Console.WriteLine(feature.geometry.coordinates[0] + " " + feature.geometry.coordinates[1]);
            return View(ParkService.getAllParks());
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }
    }
}