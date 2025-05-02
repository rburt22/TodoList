using Microsoft.EntityFrameworkCore;
using TodoList.Models;

namespace TodoList.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        
        public DbSet<TodoItem> TodoItems { get; set; }
        public DbSet<Category> Categories { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Seed some default categories
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Work", Color = "#ff6b6b" },
                new Category { Id = 2, Name = "Personal", Color = "#48dbfb" },
                new Category { Id = 3, Name = "Shopping", Color = "#1dd1a1" },
                new Category { Id = 4, Name = "Health", Color = "#5f27cd" }
            );
            
            // Set up relationships
            modelBuilder.Entity<TodoItem>()
                .HasOne(t => t.Category)
                .WithMany(c => c.TodoItems)
                .HasForeignKey(t => t.CategoryId);
        }
    }
}
