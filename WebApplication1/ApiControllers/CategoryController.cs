using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApplication1.Models;

namespace WebApplication1.ApiControllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    [RoutePrefix("api/category")]
    public class CategoryController : ApiController
    {
        DiorDBEntities1 db = new DiorDBEntities1();

        // GET: api/category
        [HttpGet]
        [Route("")]
        public IHttpActionResult GetAllCategories()
        {
            var categories = db.Categories.ToList();
            return Ok(categories);
        }

        // GET: api/category/5
        [HttpGet]
        [Route("{id:int}")]
        public IHttpActionResult GetCategoryById(int id)
        {
            var category = db.Categories.Find(id);
            if (category == null)
            {
                return NotFound();
            }
            return Ok(category);
        }

        // POST: api/category/register
        [HttpPost]
        [Route("add")]
        public IHttpActionResult RegisterCategory(Category category)
        {
            try
            {
                var exists = db.Categories.Any(c => c.CategoryName == category.CategoryName);
                if (exists)
                {
                    return BadRequest("Category with the same name already exists.");
                }

                db.Categories.Add(category);
                db.SaveChanges();
                return Ok("Category added successfully.");
            }
            catch (Exception)
            {
                return InternalServerError(new Exception("Server error while adding category."));
            }
        }

        // PUT: api/category/update
        [HttpPut]
        [Route("update")]
        public IHttpActionResult UpdateCategory(Category category)
        {
            var existing = db.Categories.Find(category.CategoryID);
            if (existing == null)
                return NotFound();

            existing.CategoryName = category.CategoryName;
            db.SaveChanges();
            return Ok("Category updated.");
        }

        // DELETE: api/category/delete/5
        [HttpDelete]
        [Route("delete/{id:int}")]
        public IHttpActionResult DeleteCategory(int id)
        {
            var category = db.Categories.Find(id);
            if (category == null)
                return NotFound();

            db.Categories.Remove(category);
            db.SaveChanges();
            return Ok("Category deleted.");
        }
    }
}
