using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApplication1.Models;

namespace WebApplication1.ApiControllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    [RoutePrefix("api/perfume")]
    public class PerfumeController : ApiController
    {
        DiorDBEntities1 db = new DiorDBEntities1();

        // GET: api/perfume
        [HttpGet]
        [Route("")]
        public IHttpActionResult GetAllPerfumes()
        {
            var perfumes = db.Perfumes.ToList();
            return Ok(perfumes);
        }

        // GET: api/perfume/5
        [HttpGet]
        [Route("{id:int}")]
        public IHttpActionResult GetPerfumeById(int id)
        {
            var perfume = db.Perfumes.Find(id);
            if (perfume == null)
                return NotFound();

            return Ok(perfume);
        }

        // POST: api/perfume/register
        [HttpPost]
        [Route("register")]
        public IHttpActionResult AddPerfume(Perfume perfume)
        {
            try
            {
                db.Perfumes.Add(perfume);
                db.SaveChanges();
                return Ok("Perfume added successfully.");
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // PUT: api/perfume/update
        [HttpPut]
        [Route("update")]
        public IHttpActionResult UpdatePerfume(Perfume perfume)
        {
            var existing = db.Perfumes.Find(perfume.PerfumeID);
            if (existing == null)
                return NotFound();

            existing.PerfumeName = perfume.PerfumeName;
            existing.PerfumeImg = perfume.PerfumeImg;
            existing.PerfumePrice = perfume.PerfumePrice;
            existing.PerfumeQuantity = perfume.PerfumeQuantity;
            existing.PerfumeDescription = perfume.PerfumeDescription;
            existing.PerfumeCatID = perfume.PerfumeCatID;

            db.SaveChanges();
            return Ok("Perfume updated.");
        }

        // DELETE: api/perfume/delete/5
        [HttpDelete]
        [Route("delete/{id:int}")]
        public IHttpActionResult DeletePerfume(int id)
        {
            var perfume = db.Perfumes.Find(id);
            if (perfume == null)
                return NotFound();

            db.Perfumes.Remove(perfume);
            db.SaveChanges();
            return Ok("Perfume deleted.");
        }

        // GET: api/perfume/category/{catId}
        [HttpGet]
        [Route("category/{catId:int}")]
        public IHttpActionResult GetPerfumesByCategory(int catId)
        {
            var perfumes = db.Perfumes.Where(p => p.PerfumeCatID == catId).ToList();

            if (perfumes == null || !perfumes.Any())
                return NotFound();

            return Ok(perfumes);
        }

        [HttpGet]
        [Route("categories")]
        public IHttpActionResult GetCategories()
        {
            var categories = db.Categories.Select(c => new { c.CategoryID, c.CategoryName }).ToList();
            return Ok(categories);
        }


    }


}
