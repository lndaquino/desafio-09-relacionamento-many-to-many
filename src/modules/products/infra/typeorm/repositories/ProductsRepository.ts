import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import AppError from '@shared/errors/AppError';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const findProduct = await this.ormRepository.findOne({
      where: {
        name,
      },
    });

    return findProduct;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const requestedProducts = await this.ormRepository.findByIds(products);

    if (requestedProducts.length !== products.length)
      throw new AppError('Invalid product');

    return requestedProducts;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const updatedProducts = Promise.all(
      products.map(async product => {
        const productToUpdate = await this.ormRepository.findOne({
          where: { id: product.id },
        });

        if (!productToUpdate) throw new AppError('Invalid product.');

        productToUpdate.quantity -= product.quantity;

        const updatedProduct = await this.ormRepository.save(productToUpdate);

        return updatedProduct;
      }),
    );
    return updatedProducts;
  }
}

export default ProductsRepository;
