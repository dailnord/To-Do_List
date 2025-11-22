using Microsoft.EntityFrameworkCore;

namespace ToDoList.Models
{
    public class TaskDbContext : DbContext
    {
        public TaskDbContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<Task> Tasks { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Task>().ToTable("Tasks");
        }
    }
}
