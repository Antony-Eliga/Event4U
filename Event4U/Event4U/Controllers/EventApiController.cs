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
    [System.Web.Mvc.Authorize]
    public class EventApiController : Controller
    {
        private ApplicationDbContext db = new ApplicationDbContext();

        [System.Web.Mvc.AllowAnonymous]
        // GET: Events
        public JsonResult IndexJson()
        {
            db.Configuration.ProxyCreationEnabled = false;
            return Json(db.Events.ToList(), JsonRequestBehavior.AllowGet);
        }

        [System.Web.Mvc.AllowAnonymous]
        public ActionResult DetailEvent(int id)
        {
            db.Events.Find(id);
            return PartialView(@"~/Views/Events/DetailEvent.cshtml", db.Events.Find(id));
        }

        [System.Web.Mvc.AllowAnonymous]
        public JsonResult GetImagesByEvent(int id)
        {
            db.Configuration.ProxyCreationEnabled = false;
            return Json(db.Events.Find(id), JsonRequestBehavior.AllowGet);
        }

        public JsonResult DeleteImageById(int id)
        {
            Image img = db.Images.Find(id);

            if (img != null)
            {
                db.Images.Remove(img);
                db.SaveChanges();
                return Json(new { Message = "Ok" }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(new { Message = "Nok" }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}
