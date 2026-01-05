import axiosInstance from '../axios/axiosInstance';
import { useEffect, useState } from 'react';

export const useCommerceCategories = () => {
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [subCategories2, setSubCategories2] = useState([]);


    const fetchBrands = async () => {
        try {
            const response = await axiosInstance.get(`brand/get-brands-list`);
            if (response.data.statusCode === 200) {
                setBrands(response.data.data);
            } else {
                setBrands([]);
            }
        } catch (error) {
            console.error('Error fetching brands:', error);
            setBrands([]);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axiosInstance.get(`category/get-categories`);
            if (response.data.statusCode === 200) {
                setCategories(response.data.data);
            } else {
                setCategories([]);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        }
    };

    const fetchSubCategories = async () => {
        try {
            const response = await axiosInstance.get(`subcategory/get-sub-categories`);
            if (response.data.statusCode === 200) {
                setSubCategories(response.data.data);
            } else {
                setSubCategories([]);
            }
        } catch (error) {
            console.error('Error fetching sub-categories:', error);
            setSubCategories([]);
        }
    };

    const fetchSubCategories2 = async () => {
        try {
            const response = await axiosInstance.get(`subcategoryTwo/get-sub-categories-two`);
            if (response.data.statusCode === 200) {
                setSubCategories2(response.data.data);
            } else {
                setSubCategories2([]);
            }
        } catch (error) {
            console.error('Error fetching sub-categories:', error);
            setSubCategories2([]);
        }
    };


    useEffect(() => {
        Promise.all([fetchBrands(), fetchCategories(), fetchSubCategories(), fetchSubCategories2()]);
    }, [])

    return { brands, categories, subCategories, subCategories2, fetchBrands, fetchCategories, fetchSubCategories, fetchSubCategories2 };

}