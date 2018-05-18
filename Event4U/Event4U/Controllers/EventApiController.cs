using Event4U.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Mvc;
using BO;

namespace Event4U.Controllers
{
    public class EventApiController : Controller
    {
        private ApplicationDbContext db = new ApplicationDbContext();

        // GET: Events
        public JsonResult IndexJson()
        {
            return Json(db.Events.ToList(), JsonRequestBehavior.AllowGet);
        }

        public ActionResult DetailEvent(int id)
        {
            return PartialView(@"~/Views/Events/DetailEvent.cshtml", db.Events.Find(id));
        }
    }
}
