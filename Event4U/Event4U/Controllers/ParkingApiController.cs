using Event4U.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Mvc;
using BO;
using Newtonsoft.Json;

namespace Event4U.Controllers
{
    public class ParkingApiController : Controller
    {
        private ApplicationDbContext db = new ApplicationDbContext();

        public ActionResult DetailParking(Park park)
        {
            return PartialView(@"~/Views/Parks/DetailParking.cshtml", park);
        }
    }
}
