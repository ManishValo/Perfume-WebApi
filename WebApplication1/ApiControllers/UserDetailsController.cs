using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using WebApplication1.Models;
using System.Web.Http.Cors;
namespace WebApplication1.ApiControllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*", exposedHeaders: "SampleHeader")]
    [RoutePrefix("api/user")]
    public class UserDetailsController : ApiController
    {
        DiorDBEntities1 db = new DiorDBEntities1();
        [HttpGet]
        [Route("get-all")]
        public IHttpActionResult GetUserDetail()
        {
            List<UserDetail> user = db.UserDetails.ToList();
            return Ok(user);
        }

        [HttpGet]
        [Route("get-by-id/{id}")]
        [Route("{id}")]
        public IHttpActionResult GetUserDetailByID(int ID)
        {
            try
            {
                var user = db.UserDetails.Find(ID);
                if (user == null)
                {
                    return NotFound();
                }
                //UserDetail user = db.UserDetails.Where(u => u.UserID == ID).FirstOrDefault();
                return Ok(user);

            }
            catch (Exception)
            {
                return InternalServerError(new Exception("Server Error"));
            }
        }


        [HttpPost]
        [Route("register")]
        public IHttpActionResult PostRegisterUserDetail(UserDetail details)
        {
            try
            {
                var exist = db.UserDetails.FirstOrDefault(u => u.UserEmail == details.UserEmail);
                if (exist == null)
                {
                    db.UserDetails.Add(new UserDetail
                    {
                        UserName = details.UserName,
                        UserEmail = details.UserEmail,
                        UserPassword = details.UserPassword,
                        TypeId = details.TypeId,
                        // Other fields remain null
                    });

                    db.SaveChanges();
                    return Ok("Registered successfully");
                }
                else
                {
                    return BadRequest("User already exists with this email");
                }
            }
            catch (Exception)
            {
                return InternalServerError(new Exception("Server Error"));
            }
        }


        [HttpPost]
        [Route("login")]
        public IHttpActionResult PostLoginuserDetail(UserDetail user)
        {
            var logindata = db.UserDetails.FirstOrDefault(u => u.UserEmail == user.UserEmail && u.UserPassword == user.UserPassword);
            if (logindata != null)
            {
                return Ok(new {
                    UserID=logindata.UserID,
                    email=logindata.UserEmail,
                    name = logindata.UserName,
                    password=logindata.UserPassword,
                    TypeID = logindata.TypeId });
            }
            else
            {
                return NotFound();
            }

        }

        [HttpPut]
        [Route("update-contact/{email}")]
        public IHttpActionResult UpdateContactDetails(string email, UserDetail updatedDetails)
        {
            try
            {
                var user = db.UserDetails.FirstOrDefault(u => u.UserEmail == email);
                if (user == null)
                {
                    return NotFound();
                }

                user.MobileNo = updatedDetails.MobileNo;
                user.Address = updatedDetails.Address;
                user.City = updatedDetails.City;
                user.Pincode = updatedDetails.Pincode;

                db.SaveChanges();
                return Ok("Contact details updated successfully.");
            }
            catch (Exception)
            {
                return InternalServerError(new Exception("Failed to update user details."));
            }
        }


        [HttpDelete]
        [Route("delete/{id}")]
        public IHttpActionResult DeleteUserDetail(int id)
        {
            var user = db.UserDetails.Find(id);
            if (user == null)
            {
                return NotFound();
            }

            db.UserDetails.Remove(user);
            db.SaveChanges();
            return Ok("User deleted");
        }
    }
}