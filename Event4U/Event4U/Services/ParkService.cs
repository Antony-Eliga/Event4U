using BO;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Helpers;

namespace Event4U.Services
{
    public static class ParkService
    {
        private const string BASE_URL = @"http://data.citedia.com/r1/";

        public static Parks.RootObject getParks()
        {
            WebClient client = new WebClient();
            string address = BASE_URL + "parks";
            string json = client.DownloadString(address);
            return JsonConvert.DeserializeObject<Parks.RootObject>(json);
        }

        public static List<Parks.Park> getAllParks()
        {
            Parks.RootObject rootObject = getParks();
            return rootObject.parks;
        }

        public static Parks.Features getFeatures()
        {
            Parks.RootObject rootObject = getParks();
            return rootObject.features;
        }

        public static List<Parks.Feature> getAllFeatures()
        {
            Parks.Features rootObject = getFeatures();
            return rootObject.features;
        }

        public static Parks.Park getOnePark(string id)
        {
            WebClient client = new WebClient();
            string address = BASE_URL + "parks/" + id;
            string json = client.DownloadString(address);
            Parks.ParkInformation info = JsonConvert.DeserializeObject<Parks.ParkInformation>(json);
            Parks.Park park = new Parks.Park();
            park.id = id;
            park.parkInformation = info;
            return park;
        }

        public static Parks.Feature getOneFeature(string id)
        {
            List<Parks.Feature> features = getAllFeatures();
            return features.Find(m => m.id == id);
        }
    }
}